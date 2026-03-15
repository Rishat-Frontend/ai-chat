'use client';

import { useState, useEffect } from 'react';
import UploadForm from '@/app/components/Documents/UploadForm';
import DocumentList from '@/app/components/Documents/DocumentList';
import StatsCard from '@/app/components/Documents/StatsCard';

interface Document {
    source: string;
    count: number;
    added: number;
}

interface Stats {
    totalChunks: number;
    modelLoaded: boolean;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDocuments = async () => {
        try {
            const response = await fetch('/api/documents');
            const data = await response.json();
            setDocuments(data.documents || []);
            setStats(data.stats);
        } catch (error) {
            console.error('Ошибка загрузки документов:', error);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpload = async (text, source) => {
        setLoading(true);
        try {
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, source: source || undefined })
            });

            const data = await response.json();
            if (data.success) {
                await fetchDocuments();
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (source: string) => {
        if (!confirm(`Удалить все документы из источника "${source}"?`)) return;

        try {
            const response = await fetch(`/api/documents?source=${encodeURIComponent(source)}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                await fetchDocuments();
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Удалить ВСЕ документы?')) return;

        try {
            const response = await fetch('/api/documents', {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                await fetchDocuments();
            }
        } catch (error) {
            console.error('Ошибка очистки:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">📄 Управление документами</h1>

            {/* Использовать компонент StatsCard */}
            {stats && (
                <StatsCard
                    totalChunks={stats.totalChunks}
                    modelLoaded={stats.modelLoaded}
                />
            )}

            {/* Использовать компонент UploadForm */}
            <UploadForm
                onUpload={handleUpload}
                loading={loading}
            />

            {/* Использовать компонент DocumentList */}
            <DocumentList
                documents={documents}
                onDelete={handleDelete}
                onClearAll={handleClearAll}
            />
        </div>
    );
}
