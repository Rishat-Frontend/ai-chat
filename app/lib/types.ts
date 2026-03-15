// Типы для сообщений
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
    role: MessageRole;
    content: string;
}

// Типы для документов
export interface DocumentChunk {
    text: string;
    embedding: number[];
    metadata: {
        source: string;
        chunkIndex: number;
        added: number;
    };
}

export interface DocumentSource {
    source: string;
    count: number;
    added: number;
}

// Типы для статистики
export interface RAGStats {
    totalChunks: number;
    sources: DocumentSource[];
    modelLoaded: boolean;
}

// Типы для API запросов
export interface ChatRequest {
    messages: Message[];
    stream?: boolean;
    useRag?: boolean;
    model?: string;
}

export interface ChatResponse {
    message: string;
    tokens: number;
    model: string;
    contextUsed: boolean;
}

export interface DocumentUploadRequest {
    text: string;
    source?: string;
}

export interface DocumentUploadResponse {
    success: boolean;
    chunksAdded: number;
    totalChunks: number;
    error?: string;
}
