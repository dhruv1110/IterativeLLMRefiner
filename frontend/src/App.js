import React, { useState, useEffect } from "react";
import { generateResponse, fetchModels, fetchModelInfo, pullModel, fetchAvailableModels } from "./api";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./styles.css"; // Import the CSS file

function App() {
    const [prompt, setPrompt] = useState("");
    const [models, setModels] = useState({});
    const [selectedModels, setSelectedModels] = useState([]);
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeoutError, setTimeoutError] = useState("");
    const [needReasoning, setNeedReasoning] = useState(false);
    const [ramOptions, setRamOptions] = useState([]);
    const [useCaseOptions, setUseCaseOptions] = useState([]);
    const [selectedRam, setSelectedRam] = useState("");
    const [selectedUseCase, setSelectedUseCase] = useState("");
    const [modelInfo, setModelInfo] = useState({});
    const [availableModels, setAvailableModels] = useState([]);
    const [downloadProgress, setDownloadProgress] = useState({ status: "", completed: 0, total: 0 });

    useEffect(() => {
        fetchModels().then((data) => {
            setModels(data.models);
            setRamOptions(Object.keys(data.models));
            setUseCaseOptions(Object.keys(data.models["8GB"])); // Assuming all RAM options have the same use cases
        }).catch(() => {
            setModels([]);
        });

        fetchModelInfo().then((data) => {
            setModelInfo(data);
        }).catch(() => {
            setModelInfo({});
        });

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
            (chunk) => setResponse(prev => prev + chunk),
            (errorMessage) => {
                setTimeoutError(errorMessage);
                setLoading(false);
            }
        );

        setLoading(false);
    };

    const handleRamChange = (e) => {
        console.log(e.target.value);
        setSelectedRam(e.target.value);
        setSelectedModels([]);
        fetchAvailableModels().then((data) => {
            setAvailableModels(data.models);
        }).catch(() => {
            setAvailableModels([]);
        });
    };

    const handleUseCaseChange = (e) => {
        console.log(e.target.value);
        setSelectedUseCase(e.target.value);
        setSelectedModels([]);
        fetchAvailableModels().then((data) => {
            setAvailableModels(data.models);
        }).catch(() => {
            setAvailableModels([]);
        });
    };

    const handlePullModel = async (modelName) => {
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
            (chunk) => {
                const data = JSON.parse(chunk);
                if (data.status === "success") {
                    setDownloadProgress({ status: "Download completed", completed: data.completed, total: data.total });
                    setLoading(false);
                } else {
                    setDownloadProgress({ status: data.status, completed: data.completed || 0, total: data.total || 0 });
                }
            },
            (error) => {
                setTimeoutError("Error pulling model: " + error.message);
                setLoading(false);
            }
        );

        fetchAvailableModels().then((data) => {
            setAvailableModels(data.models);
        }).catch(() => {
            setAvailableModels([]);
        });
    };

    const filteredModels = selectedRam && selectedUseCase ? models[selectedRam][selectedUseCase] : [];

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
                        filteredModels.map((model) => (
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
                                    <button onClick={() => handlePullModel(model)} disabled={loading} className="pull-button">
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

                <div className="response-box">
                    <ReactMarkdown
                        children={response}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        children={String(children).replace(/\n$/, "")}
                                        style={dark}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                    />
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    />
                </div>

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

export default App;