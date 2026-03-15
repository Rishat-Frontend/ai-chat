import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getRAG } from '@/app/lib/rag';
import { ChatRequest, Message } from '@/app/lib/types';

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY!,
    baseURL: 'https://api.groq.com/openai/v1'
});

export async function POST(request: Request) {
    try {
        const { messages, stream = true, useRag = true, model = 'llama-3.1-8b-instant' } =
            await request.json() as ChatRequest;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Неверный формат сообщений' },
                { status: 400 }
            );
        }

        // Находим system prompt
        let systemPrompt = messages.find(m => m.role === 'system')?.content ||
            'Ты полезный ассистент. Отвечай на русском языке, кратко и по делу.';

        const userQuery = messages[messages.length - 1]?.content || '';

        // RAG контекст
        let context = '';
        if (useRag) {
            try {
                const rag = getRAG();
                const stats = rag.getStats();
                console.log(context);
                if (stats.totalChunks > 0) {
                    context = await rag.getContext(userQuery);
                    if (context) {
                        console.log('context',context);
                        systemPrompt += `\n\nВАЖНО: Используй ТОЛЬКО эту информацию для ответа:\n${context}`;
                    }
                }
            } catch (ragError) {
                console.error('RAG Error:', ragError);
            }
        }

        // Формируем сообщения для AI
        const updatedMessages: Message[] = [
            { role: 'system', content: systemPrompt },
            ...messages.filter(m => m.role !== 'system')
        ];

        if (!stream) {
            // Обычный режим
            const response = await client.chat.completions.create({
                model,
                messages: updatedMessages,
                temperature: 0.7,
                max_tokens: 1024,
                stream: false,
            });

            return NextResponse.json({
                message: response.choices[0].message.content,
                tokens: response.usage?.total_tokens || 0,
                model: response.model,
                contextUsed: !!context
            });
        } else {
            // Стрим режим
            const streamResponse = await client.chat.completions.create({
                model,
                messages: updatedMessages,
                temperature: 0.7,
                max_tokens: 1024,
                stream: true,
            });

            const encoder = new TextEncoder();
            const customStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of streamResponse) {
                            const content = chunk.choices[0]?.delta?.content || '';
                            if (content) {
                                controller.enqueue(encoder.encode(content));
                            }
                        }
                        controller.close();
                    } catch (error) {
                        controller.error(error);
                    }
                },
            });

            return new Response(customStream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-cache',
                },
            });
        }

    } catch (error: any) {
        console.error('❌ API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
