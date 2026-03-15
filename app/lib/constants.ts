export const MODELS = {
    'llama-3.1-8b-instant': 'Llama 3.1 8B (быстрая)',
    'llama-3.3-70b-versatile': 'Llama 3.3 70B (мощная)',
    'deepseek-r1-distill-llama-70b': 'DeepSeek R1 70B',
    'qwen-2.5-coder-32b': 'Qwen Coder 32B',
} as const;

export type ModelId = keyof typeof MODELS;

export const CHUNK_SIZE = 100;
export const CHUNK_OVERLAP = 20;
export const MAX_CONTEXT_CHUNKS = 3;
