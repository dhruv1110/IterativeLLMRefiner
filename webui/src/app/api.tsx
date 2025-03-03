import modelInfo from './models_info.json';
import Errors from "undici-types/errors";
import ResponseStatusCodeError = Errors.ResponseStatusCodeError;


export async function fetchModelInfo() {
    try {
        return modelInfo;
    } catch (error) {
        console.error("Error fetching model info:", error);
        return {};
    }
}

export async function generateResponse(prompt: string, models: string[], needReasoning: boolean, onChunk: (chunk: string) => void, onTimeout: (message: string) => void) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        onTimeout("Request timed out. Please try again.");
    }, 600000); // 600-second timeout

    try {
        const response = await fetch("http://localhost:8000/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, models, needReasoning }),
            signal: controller.signal, // Attach the signal for timeout handling
        });

        clearTimeout(timeoutId); // Clear the timeout if the request succeeds

        if (!response.body) {
            throw new Error("No response body for streaming.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunkText = decoder.decode(value, { stream: true });
            onChunk(chunkText); // Append streamed chunks to response
        }
    } catch (error: any) {
        if (error.name === "AbortError") {
            console.error("Request timeout exceeded.");
        } else {
            console.error("Error fetching response:", error);
        }
    }
}


export async function fetchAvailableModels() {
    try {
        const response = await fetch("http://localhost:8000/models");
        const data = await response.json();
        return Array.isArray(data.models) ? data : { models: [] };  // Ensure response is always an object with models array
    } catch (error) {
        console.error("Error fetching models:", error);
        return { models: [] };  // Fallback to empty array in case of error
    }
}


export async function pullModel(modelName: string, onChunk: (chunk: string) => void, onError: (error: { message: string }) => void, onTimeout: (message: string) => void) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        onTimeout("Request timed out. Please try again.");
    }, 1200000); // 600-second timeout

    try {
        const response = await fetch(`http://localhost:8000/pull-model?model_name=${encodeURIComponent(modelName)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal, // Attach the signal for timeout handling
        });

        clearTimeout(timeoutId); // Clear the timeout if the request succeeds

        if (!response.body) {
            throw new Error("No response body for streaming.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunkText = decoder.decode(value, { stream: true });
            onChunk(chunkText); // Handle streamed chunks
        }
    } catch (error: any) {
        if (error.name === "AbortError") {
            console.error("Request timeout exceeded.");
        } else {
            console.error("Error pulling model:", error);
        }
        onError(error); // Handle errors
    }
}
