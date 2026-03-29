import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { tools } from '@/app/lib/tools';

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY!,
    baseURL: 'https://api.groq.com/openai/v1'
});

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        console.log('📥 Запрос к агенту:', messages);

        // Преобразуем инструменты в формат OpenAI
        const openAITools = tools.map(tool => ({
            type: 'function' as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }
        }));

        // Первый запрос к AI
        const response = await client.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                {
                    role: 'system',
                    content: 'Ты AI-агент с доступом к инструментам. Используй их когда нужно. Отвечай на русском.'
                },
                ...messages
            ],
            tools: openAITools,
            tool_choice: 'auto',
        });

        const responseMessage = response.choices[0].message;
        console.log('🤖 Ответ AI:', responseMessage);

        // Проверяем, хочет ли AI вызвать инструмент
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            console.log('🔧 AI вызывает инструменты:', responseMessage.tool_calls);

            // Вызываем инструменты
            const toolResults = await Promise.all(
                responseMessage.tool_calls.map(async (toolCall: any) => {
                    const tool = tools.find(t => t.name === toolCall.function.name);
                    if (!tool) return null;

                    const args = JSON.parse(toolCall.function.arguments);
                    console.log(`⚙️ Вызов ${tool.name} с аргументами:`, args);

                    const result = await tool.handler(args);
                    console.log(`✅ Результат ${tool.name}:`, result);

                    return {
                        role: 'tool' as const,
                        tool_call_id: toolCall.id,
                        content: result
                    };
                })
            );

            // Отправляем результаты обратно AI
            const secondResponse = await client.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'Ты AI-агент с доступом к инструментам.' },
                    ...messages,
                    responseMessage,
                    ...toolResults.filter(Boolean)
                ],
            });

            const finalMessage = secondResponse.choices[0].message.content;
            console.log('🎯 Финальный ответ:', finalMessage);

            return NextResponse.json({
                message: finalMessage,
                toolsUsed: responseMessage.tool_calls.map((tc: any) => tc.function.name)
            });
        }

        // Если инструменты не вызывались
        return NextResponse.json({
            message: responseMessage.content,
            toolsUsed: []
        });

    } catch (error: any) {
        console.error('❌ Ошибка агента:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
