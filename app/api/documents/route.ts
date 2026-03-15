import { NextResponse } from 'next/server';
import { getRAG } from '@/app/lib/rag';

// GET /api/documents - получить список документов
export async function GET() {
    console.log('📥 GET /api/documents');

    try {
        const rag = getRAG();
        const stats = rag.getStats();

        console.log(`📊 Статистика: ${stats.totalChunks} чанков, ${stats.sources.length} источников`);

        // Всегда возвращаем JSON, даже если нет документов
        return NextResponse.json({
            documents: stats.sources || [],
            stats: {
                totalChunks: stats.totalChunks,
                sources: stats.sources,
                modelLoaded: stats.modelLoaded
            }
        });

    } catch (error: any) {
        console.error('❌ Ошибка в GET /api/documents:', error);

        // Всегда возвращаем JSON, даже при ошибке
        return NextResponse.json(
            {
                error: error.message || 'Внутренняя ошибка сервера',
                documents: [],
                stats: {
                    totalChunks: 0,
                    sources: [],
                    modelLoaded: false
                }
            },
            { status: 500 }
        );
    }
}

// POST /api/documents - добавить документ
export async function POST(request: Request) {
    console.log('📥 POST /api/documents');

    try {
        // Получаем данные из запроса
        const body = await request.json();
        console.log('📦 Тело запроса:', body);

        const { text, source } = body;

        if (!text) {
            console.log('⚠️ Нет текста документа');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Текст документа обязателен'
                },
                { status: 400 }
            );
        }

        const rag = getRAG();

        // Добавляем документ
        const chunksAdded = await rag.addDocument(text, source || 'uploaded');

        console.log(`✅ Добавлено ${chunksAdded} чанков`);

        console.log('rag', rag)

        return NextResponse.json({
            success: true,
            chunksAdded,
            totalChunks: rag.getStats().totalChunks
        });

    } catch (error: any) {
        console.error('❌ Ошибка в POST /api/documents:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Ошибка при добавлении документа'
            },
            { status: 500 }
        );
    }
}

// DELETE /api/documents - удалить документы
export async function DELETE(request: Request) {
    console.log('📥 DELETE /api/documents');

    try {
        const { searchParams } = new URL(request.url);
        const source = searchParams.get('source');

        const rag = getRAG();
        let deletedCount = 0;

        if (source) {
            // Удаляем только из указанного источника
            deletedCount = rag.deleteBySource(source);
            console.log(`🗑️ Удалено ${deletedCount} чанков из источника "${source}"`);
        } else {
            // Удаляем все документы
            deletedCount = rag.clearAll();
            console.log(`🗑️ Удалено ${deletedCount} чанков (все документы)`);
        }

        return NextResponse.json({
            success: true,
            deletedCount,
            totalChunks: rag.getStats().totalChunks
        });

    } catch (error: any) {
        console.error('❌ Ошибка в DELETE /api/documents:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Ошибка при удалении документов'
            },
            { status: 500 }
        );
    }
}

// OPTIONS для CORS (если нужно)
export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        }
    );
}
