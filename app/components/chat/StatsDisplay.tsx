interface StatsDisplayProps {
    time: number;
    tokens: number;
}

export default function StatsDisplay({ time, tokens }: StatsDisplayProps) {
    if (time === 0) return null;

    return (
        <div className="mt-2 text-sm text-gray-500">
            ⚡ {time} сек | 📊 ~{tokens} токенов
        </div>
    );
}
