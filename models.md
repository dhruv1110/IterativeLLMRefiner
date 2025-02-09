# Models Overview

This document describes the configuration used for selecting models to build an LLM chain while respecting hardware RAM constraints. The configuration was derived by reviewing the current Ollama library pages for available models (e.g., DeepSeek‑R1, Llama3.3, Phi4, Llama3.2, Llama3.1, Mistral, Gemma, Qwen2.5, LLaVA, Gemma2, Qwen2.5‑Coder, CodeLlama, Llama3.2‑Vision, DeepSeek‑Coder‑V2, Mixtral, DeepSeek‑Coder, CodeGemma, LLaVA‑Llama3, Orca‑Mini, and DeepSeek‑V3).

## Selection Approach

- **Hardware RAM Buckets & Buffer:**  
  Each top-level category (8GB, 16GB, 32GB, 64GB, 128GB) represents the available RAM. A 20% system reserve is assumed; for example, on an 8GB system only models whose memory footprint is under approximately 6.4GB are selected.

- **Use Cases:**  
  Models are grouped by five primary use cases:
  - **GENERAL:** For broad language tasks.
  - **RESEARCH:** For in-depth analytical tasks.
  - **REASONING:** For logical problem solving.
  - **CODING:** For code generation and technical queries.
  - **VISION:** For image/multimodal tasks.

- **Quantization Trade‑Off:**  
  For lower‑RAM systems (8GB, 16GB), more aggressive 4‑bit (q4) variants are selected to minimize memory usage. For systems with 32GB or more, 8‑bit (q8) variants are preferred when possible to improve output fidelity.

- **Model Families Included:**  
  Only models confirmed to be available through Ollama (from the provided links) are used. These include families such as Llama3.1/3.2/3.3, Phi4, Mistral, Gemma/Gemma2, Qwen2.5 (and Qwen2.5‑Coder), DeepSeek‑R1/DeepSeek‑V3 (and DeepSeek‑Coder/V2), CodeLlama, LLaVA (and LLaVA‑Llama3), Orca‑Mini, and Mixtral.

Below is a summary table for each hardware bucket:

---

## 8GB Hardware

| Hardware RAM | Use Case   | Model Tag                   | Parameters | Quantization | Estimated RAM Required (GB) |
|--------------|------------|-----------------------------|------------|--------------|-----------------------------|
| 8GB          | GENERAL    | llama3.1:7b-q4              | 7B         | 4-bit        | ~3.85                       |
| 8GB          | GENERAL    | mistral:7b-q4               | 7B         | 4-bit        | ~3.85                       |
| 8GB          | GENERAL    | orca-mini:7b-q4             | 7B         | 4-bit        | ~3.85                       |
| 8GB          | RESEARCH   | gemma:2b-q4                 | 2B         | 4-bit        | ~1.1                        |
| 8GB          | RESEARCH   | gemma2:2b-q4                | 2B         | 4-bit        | ~1.1                        |
| 8GB          | RESEARCH   | deepseek-r1:7b-q4           | 7B         | 4-bit        | ~3.85                       |
| 8GB          | REASONING  | deepseek-r1:7b-q4           | 7B         | 4-bit        | ~3.85                       |
| 8GB          | REASONING  | deepseek-v3:7b-q4           | 7B         | 4-bit        | ~3.85                       |
| 8GB          | REASONING  | qwen2.5:7b-q4               | 7B         | 4-bit        | ~3.85                       |
| 8GB          | CODING     | codellama:7b-q4             | 7B         | 4-bit        | ~3.85                       |
| 8GB          | CODING     | qwen2.5-coder:7b-q4         | 7B         | 4-bit        | ~3.85                       |
| 8GB          | CODING     | deepseek-coder:7b-q4        | 7B         | 4-bit        | ~3.85                       |
| 8GB          | VISION     | llava:7b-q4                 | 7B         | 4-bit        | ~3.85                       |
| 8GB          | VISION     | llama3.2-vision:7b-q4       | 7B         | 4-bit        | ~3.85                       |
| 8GB          | VISION     | llava-llama3:7b-q4          | 7B         | 4-bit        | ~3.85                       |

---

## 16GB Hardware

| Hardware RAM | Use Case   | Model Tag                   | Parameters | Quantization | Estimated RAM Required (GB) |
|--------------|------------|-----------------------------|------------|--------------|-----------------------------|
| 16GB         | GENERAL    | llama3.2:7b-q8              | 7B         | 8-bit        | ~7.7                        |
| 16GB         | GENERAL    | mistral:7b-q8               | 7B         | 8-bit        | ~7.7                        |
| 16GB         | GENERAL    | phi4:14b-q4                | 14B        | 4-bit        | ~7.7                        |
| 16GB         | RESEARCH   | gemma:7b-q4                 | 7B         | 4-bit        | ~3.85                       |
| 16GB         | RESEARCH   | gemma2:7b-q4                | 7B         | 4-bit        | ~3.85                       |
| 16GB         | RESEARCH   | deepseek-r1:7b-q8           | 7B         | 8-bit        | ~7.7                        |
| 16GB         | REASONING  | deepseek-r1:7b-q8           | 7B         | 8-bit        | ~7.7                        |
| 16GB         | REASONING  | deepseek-v3:7b-q8           | 7B         | 8-bit        | ~7.7                        |
| 16GB         | REASONING  | qwen2.5:7b-q8               | 7B         | 8-bit        | ~7.7                        |
| 16GB         | CODING     | codellama:7b-q8             | 7B         | 8-bit        | ~7.7                        |
| 16GB         | CODING     | qwen2.5-coder:7b-q8         | 7B         | 8-bit        | ~7.7                        |
| 16GB         | CODING     | deepseek-coder-v2:7b-q4     | 7B         | 4-bit        | ~3.85                       |
| 16GB         | VISION     | llava:7b-q8                 | 7B         | 8-bit        | ~7.7                        |
| 16GB         | VISION     | llama3.2-vision:7b-q8       | 7B         | 8-bit        | ~7.7                        |
| 16GB         | VISION     | llava-llama3:7b-q8          | 7B         | 8-bit        | ~7.7                        |

---

## 32GB Hardware

| Hardware RAM | Use Case   | Model Tag                   | Parameters | Quantization | Estimated RAM Required (GB) |
|--------------|------------|-----------------------------|------------|--------------|-----------------------------|
| 32GB         | GENERAL    | llama3.3:13b-q8             | 13B        | 8-bit        | ~14.3                       |
| 32GB         | GENERAL    | phi4:32b-q4                | 32B        | 4-bit        | ~17.6                       |
| 32GB         | GENERAL    | mistral:14b-q8             | 14B        | 8-bit        | ~15.4                       |
| 32GB         | RESEARCH   | gemma:7b-q8                | 7B         | 8-bit        | ~7.7                        |
| 32GB         | RESEARCH   | gemma2:7b-q8               | 7B         | 8-bit        | ~7.7                        |
| 32GB         | RESEARCH   | deepseek-r1:14b-q8          | 14B        | 8-bit        | ~15.4                       |
| 32GB         | REASONING  | deepseek-r1:14b-q8          | 14B        | 8-bit        | ~15.4                       |
| 32GB         | REASONING  | deepseek-v3:14b-q8          | 14B        | 8-bit        | ~15.4                       |
| 32GB         | REASONING  | qwen2.5:14b-q8              | 14B        | 8-bit        | ~15.4                       |
| 32GB         | CODING     | codellama:13b-q8            | 13B        | 8-bit        | ~14.3                       |
| 32GB         | CODING     | qwen2.5-coder:13b-q8        | 13B        | 8-bit        | ~14.3                       |
| 32GB         | CODING     | deepseek-coder:13b-q8       | 13B        | 8-bit        | ~14.3                       |
| 32GB         | VISION     | llava:13b-q8                | 13B        | 8-bit        | ~14.3                       |
| 32GB         | VISION     | llama3.2-vision:13b-q8      | 13B        | 8-bit        | ~14.3                       |
| 32GB         | VISION     | llava-llama3:13b-q8         | 13B        | 8-bit        | ~14.3                       |

---

## 64GB Hardware

| Hardware RAM | Use Case   | Model Tag                   | Parameters | Quantization | Estimated RAM Required (GB) |
|--------------|------------|-----------------------------|------------|--------------|-----------------------------|
| 64GB         | GENERAL    | llama3.3:70b-q4             | 70B        | 4-bit        | ~38.5                       |
| 64GB         | GENERAL    | phi4:70b-q4                | 70B        | 4-bit        | ~38.5                       |
| 64GB         | GENERAL    | qwen2.5:70b-q4             | 70B        | 4-bit        | ~38.5                       |
| 64GB         | RESEARCH   | gemma:70b-q4               | 70B        | 4-bit        | ~38.5                       |
| 64GB         | RESEARCH   | gemma2:70b-q4              | 70B        | 4-bit        | ~38.5                       |
| 64GB         | RESEARCH   | mixtral:70b-q4             | 70B        | 4-bit        | ~38.5                       |
| 64GB         | REASONING  | deepseek-r1:70b-q4         | 70B        | 4-bit        | ~38.5                       |
| 64GB         | REASONING  | deepseek-v3:70b-q4         | 70B        | 4-bit        | ~38.5                       |
| 64GB         | REASONING  | mistral:70b-q4             | 70B        | 4-bit        | ~38.5                       |
| 64GB         | CODING     | codellama:70b-q4           | 70B        | 4-bit        | ~38.5                       |
| 64GB         | CODING     | qwen2.5-coder:70b-q4       | 70B        | 4-bit        | ~38.5                       |
| 64GB         | CODING     | deepseek-coder:70b-q4      | 70B        | 4-bit        | ~38.5                       |
| 64GB         | VISION     | llava:70b-q4               | 70B        | 4-bit        | ~38.5                       |
| 64GB         | VISION     | llama3.2-vision:70b-q4     | 70B        | 4-bit        | ~38.5                       |
| 64GB         | VISION     | llava-llama3:70b-q4        | 70B        | 4-bit        | ~38.5                       |

---

## 128GB Hardware

| Hardware RAM | Use Case   | Model Tag                   | Parameters | Quantization | Estimated RAM Required (GB) |
|--------------|------------|-----------------------------|------------|--------------|-----------------------------|
| 128GB        | GENERAL    | llama3.3:70b-q8             | 70B        | 8-bit        | ~77                         |
| 128GB        | GENERAL    | phi4:110b-q8               | 110B       | 8-bit        | ~121                        |
| 128GB        | GENERAL    | mistral:110b-q8            | 110B       | 8-bit        | ~121                        |
| 128GB        | RESEARCH   | gemma:110b-q8              | 110B       | 8-bit        | ~121                        |
| 128GB        | RESEARCH   | gemma2:110b-q8             | 110B       | 8-bit        | ~121                        |
| 128GB        | RESEARCH   | mixtral:110b-q8            | 110B       | 8-bit        | ~121                        |
| 128GB        | REASONING  | deepseek-r1:110b-q8        | 110B       | 8-bit        | ~121                        |
| 128GB        | REASONING  | deepseek-v3:110b-q8        | 110B       | 8-bit        | ~121                        |
| 128GB        | REASONING  | qwen2.5:110b-q8            | 110B       | 8-bit        | ~121                        |
| 128GB        | CODING     | codellama:110b-q8          | 110B       | 8-bit        | ~121                        |
| 128GB        | CODING     | qwen2.5-coder:110b-q8      | 110B       | 8-bit        | ~121                        |
| 128GB        | CODING     | deepseek-coder:110b-q8     | 110B       | 8-bit        | ~121                        |
| 128GB        | VISION     | llava:110b-q8              | 110B       | 8-bit        | ~121                        |
| 128GB        | VISION     | llama3.2-vision:110b-q8    | 110B       | 8-bit        | ~121                        |
| 128GB        | VISION     | llava-llama3:110b-q8       | 110B       | 8-bit        | ~121                        |

---

*Note:* The **Estimated RAM Required (GB)** values are approximate calculations based on the formula:  
**Estimated Memory (GB) = (Parameters × (Quantization Bits / 8)) × 1.1**  
For instance, a 7B model at 4‑bit quantization uses roughly 7 × 0.5 × 1.1 ≈ 3.85 GB.

This configuration is designed to maximize model capability within each hardware constraint.


