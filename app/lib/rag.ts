import { pipeline } from '@xenova/transformers';
import { DocumentChunk, DocumentSource, RAGStats } from './types';
import { CHUNK_SIZE, CHUNK_OVERLAP, MAX_CONTEXT_CHUNKS } from './constants';
import { saveDocuments, loadDocuments } from './storage';

export class RAGSystem {
    private documents: DocumentChunk[] = [];
    private embedder: any = null;
    private initializing = false;
    private initPromise: Promise<any> | null = null;

    constructor() {
        this.documents = loadDocuments();
        console.log(`📚 Загружено ${this.documents.length} чанков из хранилища`);
    }

    // Разбивка текста на чанки
    private splitIntoChunks(text: string): string[] {
        const words = text.split(' ');
        const chunks: string[] = [];

        for (let i = 0; i < words.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
            const chunk = words.slice(i, i + CHUNK_SIZE).join(' ');
            chunks.push(chunk);
        }

        return chunks;
    }

    // Инициализация модели эмбеддингов
    private async initEmbedder(): Promise<any> {
        if (this.embedder) return this.embedder;
        if (this.initializing && this.initPromise) return this.initPromise;

        this.initializing = true;
        console.log('🔄 Загрузка модели эмбеддингов...');

        this.initPromise = (async () => {
            try {
                this.embedder = await pipeline(
                    'feature-extraction',
                    'Xenova/all-MiniLM-L6-v2'
                );
                console.log('✅ Модель эмбеддингов загружена');
                return this.embedder;
            } catch (error) {
                console.error('❌ Ошибка загрузки модели:', error);
                throw error;
            } finally {
                this.initializing = false;
            }
        })();

        return this.initPromise;
    }

    // Получение эмбеддинга
    private async getEmbedding(text: string): Promise<number[] | null> {
        try {
            const embedder = await this.initEmbedder();
            const result = await embedder(text, {
                pooling: 'mean',
                normalize: true
            });
            return Array.from(result.data) as number[];
        } catch (error) {
            console.error('❌ Ошибка получения эмбеддинга:', error);
            return null;
        }
    }

    // Косинусное сходство
    private cosineSimilarity(a: number[], b: number[]): number {
        if (!a || !b || a.length !== b.length) return 0;

        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

        if (magnitudeA === 0 || magnitudeB === 0) return 0;

        return dotProduct / (magnitudeA * magnitudeB);
    }

    // Добавление документа
    async addDocument(text: string, source: string = 'uploaded'): Promise<number> {
        const chunks = this.splitIntoChunks(text);
        console.log(`📄 Добавляем документ, разбит на ${chunks.length} чанков`);

        let addedCount = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embedding = await this.getEmbedding(chunk);

            if (embedding) {
                this.documents.push({
                    text: chunk,
                    embedding,
                    metadata: {
                        source,
                        chunkIndex: i,
                        added: Date.now()
                    }
                });
                addedCount++;
            }
        }

        saveDocuments(this.documents);

        console.log(`✅ Добавлено ${addedCount} чанков в базу`);
        return addedCount;
    }

    // Поиск похожих документов
    async search(query: string, limit: number = MAX_CONTEXT_CHUNKS): Promise<(DocumentChunk & { score: number })[]> {
        if (this.documents.length === 0) return [];

        const queryEmbedding = await this.getEmbedding(query);
        if (!queryEmbedding) return [];

        const similarities = this.documents.map(doc => ({
            ...doc,
            score: this.cosineSimilarity(queryEmbedding, doc.embedding)
        }));

        similarities.sort((a, b) => b.score - a.score);
        return similarities.slice(0, limit);
    }

    // Получение контекста для AI
    async getContext(query: string, limit: number = MAX_CONTEXT_CHUNKS): Promise<string> {
        const results = await this.search(query, limit);

        if (results.length === 0) return '';

        return results
            .map(r => `[Релевантность ${(r.score * 100).toFixed(1)}%]\n${r.text}`)
            .join('\n\n---\n\n');
    }

    // Получение статистики
    getStats(): RAGStats {
        const sourcesMap = new Map<string, { count: number; added: number }>();

        this.documents.forEach(doc => {
            const source = doc.metadata.source;
            const existing = sourcesMap.get(source);
            if (existing) {
                existing.count++;
            } else {
                sourcesMap.set(source, { count: 1, added: doc.metadata.added });
            }
        });

        const sources: DocumentSource[] = Array.from(sourcesMap.entries()).map(([source, data]) => ({
            source,
            count: data.count,
            added: data.added
        }));

        return {
            totalChunks: this.documents.length,
            sources,
            modelLoaded: this.embedder !== null
        };
    }

    // Удаление по источнику
    deleteBySource(source: string): number {
        const beforeCount = this.documents.length;
        this.documents = this.documents.filter(d => d.metadata.source !== source);
        saveDocuments(this.documents);
        return beforeCount - this.documents.length;
    }

    // Очистка всех документов
    clearAll(): number {
        const count = this.documents.length;
        this.documents = [];
        saveDocuments(this.documents);
        return count;
    }

    // Получить все документы (для API)
    getAllDocuments(): DocumentChunk[] {
        return [...this.documents];
    }
}

// Создаем и экспортируем singleton
let ragInstance: RAGSystem | null = null;

export function getRAG(): RAGSystem {
    if (!ragInstance) {
        ragInstance = new RAGSystem();
    }
    return ragInstance;
}
