interface StatsCardProps {
    totalChunks: number;
    modelLoaded: boolean;
}

export default function StatsCard({ totalChunks, modelLoaded }: StatsCardProps) {
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">📊 Статистика</h2>
            <p>Всего чанков: {totalChunks}</p>
            <p>Модель эмбеддингов: {modelLoaded ? '✅ загружена' : '⏳ загрузка...'}</p>
        </div>
    );
}
