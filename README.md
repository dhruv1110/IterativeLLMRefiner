# IterativeLLMRefiner

IterativeLLMRefiner is an innovative project that implements a chain of Large Language Models (LLMs) to iteratively refine and improve prompts. By leveraging multiple LLMs in sequence, each model builds upon the previous output, resulting in more detailed, accurate, and coherent responses.

## Features

- **Iterative Refinement**: Uses multiple LLMs in sequence to progressively improve responses
- **Hardware-Aware**: Automatically selects models based on available RAM and use cases
- **Domain Detection**: Intelligently identifies the domain of the input prompt
- **Optional Reasoning**: Includes step-by-step reasoning for complex queries
- **Streaming Responses**: Real-time streaming of model outputs
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Modern Web Interface**: User-friendly frontend for interaction

## Prerequisites

- Docker and Docker Compose
- At least 8GB of RAM (for basic models)
- Ollama installed and running locally

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/dhruv1110/IterativeLLMRefiner.git
cd IterativeLLMRefiner
```

2. Start the application using Docker Compose:
```bash
docker-compose up
```

3. Open your browser and navigate to `http://localhost:3000`

## Architecture

The project consists of three main components:

- **Frontend**: React-based web interface for user interaction
- **Backend**: FastAPI server handling model interactions and processing
- **Ollama Integration**: Local LLM server for model inference

## Available Models

The system supports various models based on available RAM:

- 8GB: Basic models (3B-7B parameters)
- 16GB: Medium models (7B-14B parameters)
- 32GB: Large models (13B-32B parameters)
- 64GB: Extra large models (70B parameters)
- 128GB: Ultra large models (110B parameters)

Models are categorized by use case:
- General
- Research
- Reasoning
- Coding
- Vision

## API Endpoints

- `GET /models`: List available models
- `GET /pull-model`: Pull a specific model
- `POST /generate`: Generate refined responses using the model chain

## Development

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for providing the LLM infrastructure
- All the open-source LLM models used in this project
- The open-source community for their valuable contributions 