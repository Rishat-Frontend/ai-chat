import { useState } from 'react';
import React from "react";

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    loading: boolean;
}

export default function MessageInput({ onSendMessage, loading }: MessageInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        if (!input.trim() || loading) return;
        onSendMessage(input);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="bg-white border-t p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? '...' : 'Отправить'}
                </button>
            </div>
        </div>
    );
}
