'use client';

import Link from 'next/link';

interface ChatControlsProps {
    streamMode: boolean;
    useRag: boolean;
    onStreamModeChange: (value: boolean) => void;
    onUseRagChange: (value: boolean) => void;
    onClearHistory: () => void;
}

export default function ChatControls({
                                         streamMode,
                                         useRag,
                                         onStreamModeChange,
                                         onUseRagChange,
                                         onClearHistory
                                     }: ChatControlsProps) {
    return (
        <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={streamMode}
                        onChange={(e) => onStreamModeChange(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Stream режим</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={useRag}
                        onChange={(e) => onUseRagChange(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Использовать RAG</span>
                </label>
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <button
                    onClick={onClearHistory}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1"
                    title="Очистить историю"
                >
                    <span className="text-lg">🗑️</span>
                    <span className="hidden sm:inline">Очистить</span>
                </button>

                <Link
                    href="/documents"
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center gap-1"
                >
                    <span className="text-lg">📚</span>
                    <span className="hidden sm:inline">Документы</span>
                </Link>
            </div>
        </div>
    );
}
