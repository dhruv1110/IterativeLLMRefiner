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
    system_prompt = f"""
    You are an expert problem solver. Your task is to analyze the user query provided and deliver a detailed, step-by-step solution. Follow these instructions exactly:
        1. Break down the problem into its core components.
        2. Generate reasoning for each logical step.
        3. Present numbered instructions with clear dependencies.
        4. Identify potential edge cases or missing information.
        5. Limit the response to 5-7 steps, with each step explained in 1-2 concise sentences.
        6. Provide the output as raw, unformatted text without any markdown, HTML tags, code snippets, or tables (newlines are allowed).
        """

    user_prompt = f"""
    My Query:
        "{prompt}"
        """
    async for response_chunk in process_model_response('orca-mini', system_prompt, user_prompt):
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
                    system_prompt = f"""You are an expert in domain: {domain}"""
                    user_prompt = f"""
                    Here is my initial prompt: {prompt}
                        I need a better quality response for this prompt.
                        """
                else:
                    # For subsequent models, add instructions and suggest improvements
                    system_prompt = 'You are an expert language model prompt enhancer. Your task is to take an initial prompt and an improved (but unsatisfactory) version produced by another model, and then generate a significantly refined version. Do not reference or compare with the previous output. Focus on clarity, coherence, and overall quality.Do not include phrases such as “Here’s a refined version...” or “Better version.” '
                    user_prompt = f"""
                    Here is my initial prompt: {prompt}
                        I tried to improve it with the previous model, and it produced the result below, but it can be way better:
                        {whole_model_response}
                        Please improve the response quality without making any comparisons or referencing the previous model's response.
                        No disclaimers or references to any prior instructions—just pure response
                        """

                async for response_chunk in process_model_response(model, system_prompt, user_prompt):
                    whole_model_response += response_chunk
                    yield response_chunk

            except Exception as e:
                logging.error(f"Error processing model {model}: {e}")
                yield f"Error processing model {model}\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


async def process_model_response(model, system_prompt, user_prompt):
    try:
        messages = [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt}
        ]
        stream = await asyncClient.chat(
            model=model,
            messages=messages,
            stream=True
        )
        async for chunk in stream:
            print("CHUNK:", chunk)
            if not chunk:
                continue

            # Handle different response formats
            response_text = None
            if isinstance(chunk, dict):
                response_text = chunk.get('response') or chunk.get('message', {}).get('content')
            elif 'message' in chunk and 'content' in chunk['message']:
                response_text = chunk['message']['content']
            elif isinstance(chunk, str):
                try:
                    chunk_dict = json.loads(chunk)
                    response_text = chunk_dict.get('response') or chunk_dict.get('message', {}).get('content')
                except json.JSONDecodeError:
                    logging.error("Failed to parse chunk as JSON")

            if response_text:
                yield response_text

    except Exception as e:
        logging.error(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response from Ollama")

@app.post("/generate")
async def generate(request: PromptRequest):
    logging.info(f"Received request: {request}")
    return await stream_response(request.prompt, request.models, request.needReasoning)
