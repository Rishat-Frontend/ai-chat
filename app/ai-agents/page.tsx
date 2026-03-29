'use client';
import { useState, useEffect } from 'react';

export default function AIAgentsPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Привет! Я AI-агент. Я могу:\n• Узнать погоду в любом городе\n• Посчитать математические выражения\n• Сказать текущее время\n\nЧто хотите узнать?'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [toolsUsed, setToolsUsed] = useState<string[]>([]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setToolsUsed([]);

        try {
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.concat(userMessage).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message
            }]);

            if (data.toolsUsed && data.toolsUsed.length > 0) {
                setToolsUsed(data.toolsUsed);
            }

        } catch (error: any) {
            console.error('Ошибка:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ Ошибка: ${error.message}`
            }]);
        } finally {
            setLoading(false);
        }
    };

   return (
       <div>
       <div className="bg-white rounded-lg shadow p-6 h-96 overflow-y-auto mb-4">
           {messages.map((msg, i) => (
               <div
                   key={i}
                   className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
               >
                   <div
                       className={`inline-block p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                           msg.role === 'user'
                               ? 'bg-blue-500 text-white'
                               : 'bg-gray-100 text-gray-800'
                       }`}
                   >
                       {msg.content}
                   </div>
               </div>
           ))}
           {loading && (
               <div className="text-center text-gray-500 py-4">
                   🤔 Агент думает...
               </div>
           )}
       </div>
    <div className="flex gap-2">
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Например: какая погода в Москве? или сколько будет 15 * 8?"
            className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
        />
        <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        >
            {loading ? '...' : 'Отправить'}
        </button>
    </div>
       </div>
   )
}
