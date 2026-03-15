import { useEffect, useRef } from 'react';
import { Message } from '@/lib/types';

interface MessageListProps {
    messages: Message[];
    loading: boolean;
    streamMode: boolean;
}

export default function MessageList({ messages, loading, streamMode }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                msg.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white shadow'
                            }`}
                        >
                            {msg.content || (loading && streamMode && index === messages.length - 1 ? '...' : '')}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
