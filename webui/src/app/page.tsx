"use client";

import React, { useState, useEffect } from "react";
import { generateResponse, pullModel, fetchAvailableModels } from "./api";
import "./styles.css";
import {LLMModels, llmModels} from "@/app/models/LLMModels";
import {LLMModelsInfo, llmModelsInfo} from "@/app/models/LLMModelsInfo";
import ResponseBox from "@/app/components/ResponseBox/ResponseBox";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [models, setModels] = useState<LLMModels>({});
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeoutError, setTimeoutError] = useState("");
  const [needReasoning, setNeedReasoning] = useState(false);
  const [ramOptions, setRamOptions] = useState<string[]>([]);
  const [useCaseOptions, setUseCaseOptions] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string>("");
  const [selectedUseCase, setSelectedUseCase] = useState("");
  const [modelInfo, setModelInfo] = useState<LLMModelsInfo>({});
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState({ status: "", completed: 0, total: 0 });


  useEffect(() => {
    setModels(llmModels);
    setRamOptions(Object.keys(llmModels));
    setUseCaseOptions(Object.keys(llmModels["8GB"]));

    setModelInfo(llmModelsInfo)

    fetchAvailableModels().then((data) => {
      setAvailableModels(data.models);
    }).catch(() => {
      setAvailableModels([]);
    });
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setResponse("");
    setTimeoutError("");

    await generateResponse(
        prompt,
        selectedModels,
        needReasoning,
        (chunk: string) => setResponse(prev => prev + chunk),
        (errorMessage: React.SetStateAction<string>) => {
          setTimeoutError(errorMessage);
          setLoading(false);
        }
    );

    setLoading(false);
  };

  const handleRamChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    console.log(e.target.value);
    setSelectedRam(e.target.value);
    setSelectedModels([]);
    fetchAvailableModels().then((data) => {
      setAvailableModels(data.models);
    }).catch(() => {
      setAvailableModels([]);
    });
  };

  const handleUseCaseChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    console.log(e.target.value);
    setSelectedUseCase(e.target.value);
    setSelectedModels([]);
    fetchAvailableModels().then((data) => {
      setAvailableModels(data.models);
    }).catch(() => {
      setAvailableModels([]);
    });
  };

  const handlePullModel = async (modelName: any) => {
    if (!modelName) {
      setTimeoutError("Model name is required.");
      return;
    }

    setLoading(true);
    setResponse("");
    setTimeoutError("");
    setDownloadProgress({ status: "Starting...", completed: 0, total: 0 });

    await pullModel(
        modelName,
        (chunk: string) => {
          const data = JSON.parse(chunk);
          if (data.status === "success") {
            setDownloadProgress({ status: "Download completed", completed: data.completed, total: data.total });
            setLoading(false);
          } else {
            setDownloadProgress({ status: data.status, completed: data.completed || 0, total: data.total || 0 });
          }
        },
        (error: { message: string; }) => {
          setTimeoutError("Error pulling model: " + error.message);
          setLoading(false);
        },
        (message: string) => {
          setTimeoutError(message);
          setLoading(false);
        }
    );

    fetchAvailableModels().then((data) => {
      setAvailableModels(data.models);
    }).catch(() => {
      setAvailableModels([]);
    });
  };

  const filteredModels: string[] = (selectedRam && selectedUseCase) ? models[selectedRam][selectedUseCase] : [];

  return (
      <div>
        <nav className="navbar">
          <h1>LLM Chain Chat</h1>
        </nav>
        <div className="chat-container">
          <div className="input-container">
            <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt"
                className="prompt-input"
            />
            <label className="reasoning-checkbox">
              <input
                  type="checkbox"
                  checked={needReasoning}
                  onChange={(e) => setNeedReasoning(e.target.checked)}
              />
              Need Reasoning
            </label>
          </div>

          <div className="dropdown-container">
            <label>
              Select RAM:
              <select value={selectedRam} onChange={handleRamChange}>
                <option value="">Select RAM</option>
                {ramOptions.map((ram) => (
                    <option key={ram} value={ram}>{ram}</option>
                ))}
              </select>
            </label>
            <label>
              Select Use Case:
              <select value={selectedUseCase} onChange={handleUseCaseChange}>
                <option value="">Select Use Case</option>
                {useCaseOptions.map((useCase) => (
                    <option key={useCase} value={useCase}>{useCase}</option>
                ))}
              </select>
            </label>
          </div>

          <h3>Select Models for Chaining:</h3>
          <div className="models-container">
            {filteredModels.length > 0 ? (
                filteredModels.map((model: string) => (
                    <div key={model} className="model-item">
                      <label className="model-checkbox">
                        <input
                            type="checkbox"
                            value={model}
                            onChange={(e) => {
                              const selected = e.target.checked
                                  ? [...selectedModels, model]
                                  : selectedModels.filter((m) => m !== model);
                              setSelectedModels(selected);
                            }}
                        />
                        {model} - {modelInfo[model]?.parameters} parameters, {modelInfo[model]?.quantization} quantization, {modelInfo[model]?.estimated_memory_required_gb} GB memory {availableModels.includes(model) ? "(Available)" : "(Not Available)"}
                      </label>
                      {!availableModels.includes(model) && (
                          <button onClick={() => handlePullModel(model as string)} disabled={loading} className="pull-button">
                            {loading ? <div className="spinner"></div> : "Pull Model"}
                          </button>
                      )}
                    </div>
                ))
            ) : (
                <p>No models found. Make sure Ollama is running.</p>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading} className="submit-button">
            {loading ? <div className="spinner"></div> : "Submit"}
          </button>

          {loading && <p>Processing your request... Please wait.</p>}
          {timeoutError && <p style={{ color: "red" }}>{timeoutError}</p>}

          <ResponseBox response={response} />

          <div className="download-container">
            {loading && (
                <div className="progress-container">
                  <p>{downloadProgress.status}</p>
                  <progress value={downloadProgress.completed} max={downloadProgress.total}></progress>
                  <p>
                    {((downloadProgress.completed / (1024 * 1024 * 1024)).toFixed(2))} GB /
                    {((downloadProgress.total / (1024 * 1024 * 1024)).toFixed(2))} GB
                  </p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
