'use client';

import { useState, useEffect } from 'react';
import { MODELS, ModelId } from '@/app/lib/constants';
import { Message } from '@/app/lib/types';
import ChatControls from "@/app/components/chat/ChatControls";
import ModelSelector from "@/app/components/chat/ModelSelector";
import StatsDisplay from "@/app/components/chat/StatsDisplay";
import MessageList from "@/app/components/chat/MessageList";
import MessageInput from "@/app/components/chat/MessageInput";

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Привет! Я AI-ассистент. Чем могу помочь?' }
    ]);
    const [loading, setLoading] = useState(false);
    const [currentModel, setCurrentModel] = useState<ModelId>('llama-3.1-8b-instant');
    const [streamMode, setStreamMode] = useState(true);
    const [useRag, setUseRag] = useState(true);
    const [stats, setStats] = useState({ tokens: 0, time: 0 });

    useEffect(() => {
        const saved = localStorage.getItem('chat-history');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error('Ошибка загрузки истории');
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('chat-history', JSON.stringify(messages));
    }, [messages]);

    const sendMessage = async (input: string) => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setLoading(true);

        if (streamMode) {
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        }

        const startTime = Date.now();
        let tokenCount = 0;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages,
                    stream: streamMode,
                    useRag,
                    model: currentModel
                })
            });

            if (!response.ok) throw new Error('Ошибка запроса');

            if (streamMode && response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulatedContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    accumulatedContent += text;

                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].content = accumulatedContent;
                        return newMessages;
                    });

                    tokenCount += text.split(/\s+/).length;
                }
            } else {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
                tokenCount = data.tokens || 0;
            }

            const endTime = Date.now();
            setStats({
                tokens: tokenCount,
                time: Number(((endTime - startTime) / 1000).toFixed(1))
            });

        } catch (error) {
            console.error('Ошибка:', error);
            if (streamMode) {
                setMessages(prev => prev.slice(0, -1));
            }
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        setMessages([{ role: 'assistant', content: 'Привет! Я AI-ассистент. Чем могу помочь?' }]);
        localStorage.removeItem('chat-history');
        setStats({ tokens: 0, time: 0 });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-white shadow p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold">🤖 AI Чат с RAG</h1>
                        <div className="flex items-center gap-4">
                            <ModelSelector
                                currentModel={currentModel}
                                onModelChange={setCurrentModel}
                            />
                        </div>
                    </div>

                    <ChatControls
                        streamMode={streamMode}
                        useRag={useRag}
                        onStreamModeChange={setStreamMode}
                        onUseRagChange={setUseRag}
                        onClearHistory={clearHistory}
                    />

                    <StatsDisplay time={stats.time} tokens={stats.tokens} />
                </div>
            </div>

            <MessageList
                messages={messages}
                loading={loading}
                streamMode={streamMode}
            />

            <MessageInput
                onSendMessage={sendMessage}
                loading={loading}
            />
        </div>
    );
}
