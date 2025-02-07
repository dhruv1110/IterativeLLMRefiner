export async function generateResponse(prompt, models, needReasoning, onChunk, onTimeout) {
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
    } catch (error) {
        if (error.name === "AbortError") {
            console.error("Request timeout exceeded.");
        } else {
            console.error("Error fetching response:", error);
        }
    }
}

export async function fetchModels() {
    try {
        const response = await fetch("http://localhost:8000/models");
        const data = await response.json();
        return Array.isArray(data.models) ? data : { models: [] };  // Ensure response is always an object with models array
    } catch (error) {
        console.error("Error fetching models:", error);
        return { models: [] };  // Fallback to empty array in case of error
    }
}


export async function pullModel(modelName) {
    await fetch(`http://localhost:8000/pull-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_name: modelName })
    });
}
