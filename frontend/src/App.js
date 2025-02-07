import React, { useState, useEffect } from "react";
import { generateResponse, fetchModels, pullModel } from "./api";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./styles.css"; // Import the CSS file

function App() {
    const [prompt, setPrompt] = useState("");
    const [models, setModels] = useState([]);
    const [selectedModels, setSelectedModels] = useState([]);
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeoutError, setTimeoutError] = useState("");
    const [needReasoning, setNeedReasoning] = useState(false);

    useEffect(() => {
        fetchModels().then((data) => {
            setModels(Array.isArray(data.models) ? data.models : []);
        }).catch(() => {
            setModels([]);
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

                <h3>Select Models for Chaining:</h3>
                <div className="models-container">
                    {models.length > 0 ? (
                        models.map((model) => (
                            <label key={model} className="model-checkbox">
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
                                {model}
                            </label>
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
            </div>
        </div>
    );
}

export default App;