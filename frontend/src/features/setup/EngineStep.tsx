interface EngineStepProps {
  engineOption: "builtin" | "ollama" | "cloud";
  ollamaModel: string;
  provider: string;
  apiKey: string;
  onSelectEngine: (option: "builtin" | "ollama" | "cloud") => void;
  onChangeOllamaModel: (model: string) => void;
  onChangeProvider: (provider: string) => void;
  onChangeApiKey: (key: string) => void;
}

const OLLAMA_MODELS = ["nomic-embed-text", "mxbai-embed-large"];
const PROVIDERS = ["OpenAI", "Jina AI"];

export default function EngineStep({
  engineOption,
  ollamaModel,
  provider,
  apiKey,
  onSelectEngine,
  onChangeOllamaModel,
  onChangeProvider,
  onChangeApiKey,
}: EngineStepProps) {
  return (
    <div className="setup-body">
      <div className="engine-options">
        <button
          type="button"
          className={`engine-option-card ${engineOption === "builtin" ? "selected" : ""}`}
          onClick={() => onSelectEngine("builtin")}
        >
          <div className="engine-option-top">
            <h3 className="engine-option-title">Mole Built-in</h3>
            <span className="engine-badge">Default</span>
          </div>
          <p className="engine-option-subtext">
            Fast, private, and works entirely offline out of the box. Uses
            standard MiniLM.
          </p>
        </button>

        <button
          type="button"
          className={`engine-option-card ${engineOption === "ollama" ? "selected" : ""}`}
          onClick={() => onSelectEngine("ollama")}
        >
          <div className="engine-option-top">
            <h3 className="engine-option-title">Local Server (Ollama)</h3>
          </div>
          <p className="engine-option-subtext">
            Connect to your local Ollama instance for maximum privacy and custom
            models.
          </p>
        </button>

        <button
          type="button"
          className={`engine-option-card ${engineOption === "cloud" ? "selected" : ""}`}
          onClick={() => onSelectEngine("cloud")}
        >
          <div className="engine-option-top">
            <h3 className="engine-option-title">Cloud API</h3>
          </div>
          <p className="engine-option-subtext">
            Use powerful cloud models. Requires an active internet connection
            and API key.
          </p>
        </button>
      </div>

      {engineOption === "ollama" && (
        <div className="engine-form-section">
          <label className="engine-field-label" htmlFor="ollama-model">
            Select Ollama Model
          </label>
          <select
            id="ollama-model"
            className="engine-select"
            value={ollamaModel}
            onChange={(e) => onChangeOllamaModel(e.target.value)}
          >
            {OLLAMA_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      )}

      {engineOption === "cloud" && (
        <div className="engine-form-section">
          <label className="engine-field-label" htmlFor="provider">
            Provider
          </label>
          <select
            id="provider"
            className="engine-select"
            value={provider}
            onChange={(e) => onChangeProvider(e.target.value)}
          >
            {PROVIDERS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <label className="engine-field-label" htmlFor="api-key">
            API Key
          </label>
          <input
            id="api-key"
            className="engine-input"
            type="password"
            value={apiKey}
            onChange={(e) => onChangeApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
        </div>
      )}
    </div>
  );
}
