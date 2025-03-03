import json
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ollama import AsyncClient, Client
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

asyncClient = AsyncClient(
    host='http://host.docker.internal:11434'
)
client = Client(
    host='http://host.docker.internal:11434'
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PromptRequest(BaseModel):
    prompt: str
    models: list
    needReasoning: bool


@app.get("/models")
async def get_available_models():
    try:
        models_data = client.list()
        model_names = [model.model for model in models_data.models]  # Extract only names
        logging.info(f"Fetched models: {model_names}")
        return {"models": model_names}
    except Exception as e:
        logging.error(f"Failed to fetch models: {e}")
        raise HTTPException(status_code=500, detail="Cannot fetch models from Ollama")


@app.get("/pull-model")
async def pull_model(model_name: str):
    try:
        async def event_stream():
            async for chunk in await asyncClient.pull(model_name, insecure=False, stream=True):
                yield json.dumps(chunk.dict()) + "\n"  # Convert to dictionary

        logging.info(f"Started pulling model: {model_name}")
        return StreamingResponse(event_stream(), media_type="application/json")
    except Exception as e:
        logging.error(f"Failed to pull model: {e}")
        raise HTTPException(status_code=500, detail="Cannot pull model from Ollama")


def get_domain(prompt):
    response = client.chat(model='orca-mini', messages=[
        {'role': 'system', 'content': 'You are an AI that identifies the main topic of a prompt with a single word.'},
        {'role': 'user', 'content': f'Identify the domain of this prompt in one word: {prompt}'}
    ])
    return response['message']['content'].strip()


async def get_reasoning(prompt):
    prompt = f"""
Analyze the following user query and provide a detailed, step-by-step solution:

**My Query:**
"{prompt}"

**Instructions:**
1. Break down the problem into core components
2. Generate reasoning for each logical step
3. Present numbered instructions with clear dependencies
4. Identify potential edge cases or missing information
6. Limit the response to 5-7 steps with concise explanations with maximum 1-2 sentences each 
and shouldn't have any code snippets, tables or too much info.
5. Give the row unformatted output without any markdown or HTML tags. Newlines are allowed.
     ...

        """
    async for response_chunk in process_model_response('orca-mini', prompt):
        yield response_chunk


async def stream_response(prompt: str, models: list, needReasoning: bool):
    """Stream the LLM responses from Ollama with progress updates."""

    async def event_stream():
        domain = get_domain(prompt)
        logging.info(f"Domain: {domain}")
        yield f"""Looks like the domain of the prompt is: {domain}"""

        reasoning = ""
        if needReasoning:
            yield f"""
Thinking...

        """
            async for chunk in get_reasoning(prompt):
                reasoning += chunk
                yield chunk

        for index, model in enumerate(models):
            logging.info(f"Processing with model: {model}")
            yield f"""

Processing with {model}
-------------------------

"""

            try:
                whole_model_response = ""
                # For the first model, use the prompt without instructions
                if index == 0:

                    # This is my initial prompt: {prompt}
                    # Please use below reasoning to generate a better quality response:
                    model_prompt = reasoning if needReasoning else prompt
                else:
                    # For subsequent models, add instructions and suggest improvements
                    model_prompt = f"""
Here is my initial prompt: {prompt}
I tried to improve it with the previous model, and it produced below result but it can be way better:
{whole_model_response}
Please improve the response quality without making any comparisons or referencing with the previous model's response.
"""

                async for response_chunk in process_model_response(model, model_prompt):
                    whole_model_response += response_chunk
                    yield response_chunk

            except Exception as e:
                logging.error(f"Error processing model {model}: {e}")
                yield f"Error processing model {model}\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


async def process_model_response(model, model_prompt):
    try:
        stream = await asyncClient.generate(
            model=model,
            prompt=model_prompt,
            stream=True
        )
        async for chunk in stream:
            if not chunk or 'response' not in chunk:
                logging.error("Received empty or malformed response chunk")
                continue  # Don't yield empty chunks

            yield chunk['response']  # Directly return the response text

    except Exception as e:
        logging.error(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response from Ollama")


@app.post("/generate")
async def generate(request: PromptRequest):
    logging.info(f"Received request: {request}")
    return await stream_response(request.prompt, request.models, request.needReasoning)
