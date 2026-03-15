import fs from 'fs';
import path from 'path';
import { DocumentChunk } from './types';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'documents.json');

// Гарантируем что папка существует
export function ensureStorage() {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Сохранить документы
export function saveDocuments(documents: DocumentChunk[]) {
    try {
        ensureStorage();
        fs.writeFileSync(STORAGE_FILE, JSON.stringify({
            documents,
            savedAt: Date.now()
        }, null, 2));
        console.log(`💾 Сохранено ${documents.length} чанков в файл`);
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
    }
}

// Загрузить документы
export function loadDocuments(): DocumentChunk[] {
    try {
        ensureStorage();
        if (fs.existsSync(STORAGE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
            console.log(`📂 Загружено ${data.documents.length} чанков из файла`);
            return data.documents;
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
    }
    return [];
}
