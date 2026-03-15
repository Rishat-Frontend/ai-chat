import { useState } from 'react';

interface UploadFormProps {
    onUpload: (text: string, source?: string) => Promise<void>;
    loading: boolean;
}

export default function UploadForm({ onUpload, loading }: UploadFormProps) {
    const [text, setText] = useState('');
    const [source, setSource] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        await onUpload(text, source);
        setText('');
        setSource('');
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">📤 Загрузить новый документ</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Название источника
                    </label>
                    <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="Например: документация Next.js"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Текст документа
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 h-48 font-mono"
                        placeholder="Вставьте текст документа..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Загрузка...' : 'Загрузить'}
                </button>
            </form>
        </div>
    );
}
