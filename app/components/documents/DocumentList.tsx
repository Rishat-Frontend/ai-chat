interface Document {
    source: string;
    count: number;
    added: number;
}

interface DocumentListProps {
    documents: Document[];
    onDelete: (source: string) => void;
    onClearAll: () => void;
}

export default function DocumentList({ documents, onDelete, onClearAll }: DocumentListProps) {
    if (documents.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-center py-8">
                    Нет загруженных документов
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">📚 Загруженные документы</h2>
                <button
                    onClick={onClearAll}
                    className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 text-sm"
                >
                    Удалить все
                </button>
            </div>

            <div className="space-y-2">
                {documents.map((doc, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                        <div>
                            <p className="font-medium">{doc.source}</p>
                            <p className="text-sm text-gray-500">
                                Чанков: {doc.count} • Добавлен: {new Date(doc.added).toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={() => onDelete(doc.source)}
                            className="text-red-500 hover:text-red-700 text-xl"
                            title="Удалить"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
