import {
  EmbeddingProvider,
  isCloudEmbeddingProvider,
} from "../../enums/config";
import { OllamaModel } from "../../types/ollama";
import { CLOUD_PROVIDERS } from "../../constants/embeddingProvider";

interface EngineStepProps {
  engineOption: EmbeddingProvider;
  ollamaModel: string;
  cloudModel: string;
  apiKey: string;
  onSelectEngine: (option: EmbeddingProvider) => void;
  onChangeOllamaModel: (model: string) => void;
  onChangeCloudModel: (model: string) => void;
  onChangeApiKey: (key: string) => void;
  availableOllamaModels: OllamaModel[];
  ollamaLoading?: boolean;
  onRequestModels?: () => void;
}

const getProviderLabel = (provider: EmbeddingProvider): string => {
  const entry = Object.entries(CLOUD_PROVIDERS).find(
    ([key]) => key === provider,
  );
  return entry?.[1].label ?? "";
};

const getProviderModels = (provider: EmbeddingProvider): readonly string[] => {
  const entry = Object.entries(CLOUD_PROVIDERS).find(
    ([key]) => key === provider,
  );
  return entry?.[1].models ?? [];
};

export default function EngineStep({
  engineOption,
  ollamaModel,
  cloudModel,
  apiKey,
  onSelectEngine,
  onChangeOllamaModel,
  onChangeCloudModel,
  onChangeApiKey,
  availableOllamaModels,
  ollamaLoading = false,
  onRequestModels,
}: EngineStepProps) {
  return (
    <div className="setup-body">
      <div className="engine-options">
        <button
          type="button"
          className={`engine-option-card ${engineOption === EmbeddingProvider.DEFAULT ? "selected" : ""}`}
          onClick={() => onSelectEngine(EmbeddingProvider.DEFAULT)}
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
          className={`engine-option-card ${engineOption === EmbeddingProvider.OLLAMA ? "selected" : ""}`}
          onClick={() => onSelectEngine(EmbeddingProvider.OLLAMA)}
        >
          <div className="engine-option-top">
            <h3 className="engine-option-title">Local Server (Ollama)</h3>
          </div>
          <p className="engine-option-subtext">
            Connect to your local Ollama instance for maximum privacy and custom
            models.
          </p>
        </button>

        {Object.entries(CLOUD_PROVIDERS).map(([key, provider]) => (
          <button
            key={key}
            type="button"
            className={`engine-option-card ${engineOption === (key as EmbeddingProvider) ? "selected" : ""}`}
            onClick={() => onSelectEngine(key as EmbeddingProvider)}
          >
            <div className="engine-option-top">
              <h3 className="engine-option-title">{provider.label}</h3>
            </div>
            <p className="engine-option-subtext">
              Use {provider.label} for high-quality embeddings. Requires an API
              key.
            </p>
          </button>
        ))}
      </div>

      {engineOption === EmbeddingProvider.OLLAMA && (
        <div className="engine-form-section">
          <label className="engine-field-label" htmlFor="ollama-model">
            Select Ollama Model
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              id="ollama-model"
              className="engine-select"
              value={ollamaModel}
              onChange={(e) => onChangeOllamaModel(e.target.value)}
              disabled={ollamaLoading || availableOllamaModels.length === 0}
            >
              {ollamaLoading ? (
                <option>Connecting to Ollama...</option>
              ) : availableOllamaModels.length > 0 ? (
                availableOllamaModels.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))
              ) : (
                <option>No models available</option>
              )}
            </select>
            {!ollamaLoading && availableOllamaModels.length === 0 && (
              <button
                type="button"
                className="engine-retry-btn"
                onClick={() => onRequestModels && onRequestModels()}
              >
                Retry
              </button>
            )}
            {ollamaLoading && (
              <div className="engine-loading-dot" aria-hidden>
                ●
              </div>
            )}
          </div>
        </div>
      )}

      {isCloudEmbeddingProvider(engineOption) && (
        <div className="engine-form-section">
          <label className="engine-field-label" htmlFor="cloud-model">
            Model
          </label>
          {(() => {
            const models = getProviderModels(engineOption);
            if (models.length > 0) {
              return (
                <select
                  id="cloud-model"
                  className="engine-select"
                  value={cloudModel}
                  onChange={(e) => onChangeCloudModel(e.target.value)}
                >
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              );
            }

            return (
              <input
                id="cloud-model"
                className="engine-input"
                type="text"
                value={cloudModel}
                onChange={(e) => onChangeCloudModel(e.target.value)}
                placeholder={`Enter your ${getProviderLabel(engineOption)} model name`}
              />
            );
          })()}

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
