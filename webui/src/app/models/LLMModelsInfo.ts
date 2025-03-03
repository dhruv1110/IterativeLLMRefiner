export interface ModelInfo {
    parameters: string;
    quantization: string;
    estimated_memory_required_gb: string;
}

export interface LLMModelsInfo {
    [modelName: string]: ModelInfo;
}

// Import JSON (Static Import Method)
import modelsData from '../models_info.json';

// Export the parsed JSON as a TypeScript model
export const llmModelsInfo: LLMModelsInfo = modelsData;
