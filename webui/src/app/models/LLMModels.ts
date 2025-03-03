interface ModelCategories {
    [usecase: string]: string[];
}

export interface LLMModels {
    [memory: string]: ModelCategories;
}

// Import JSON (Static Import Method)
import modelsData from '../models.json';

// Export the parsed JSON as a TypeScript model
export const llmModels: LLMModels = modelsData;

