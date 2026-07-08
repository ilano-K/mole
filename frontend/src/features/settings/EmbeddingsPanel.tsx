import React from "react";
import { AppConfigBase } from "../../types/config";
import {
  EmbeddingProvider,
  isCloudEmbeddingProvider,
} from "../../enums/config";
import { OllamaModel } from "../../types/ollama";
import { CLOUD_PROVIDERS } from "../../constants/embeddingProvider";

interface Props {
  config: AppConfigBase;
  setConfig: React.Dispatch<React.SetStateAction<AppConfigBase>>;
  ollamaModels: OllamaModel[];
  ollamaLoading: boolean;
  ollamaError: string;
  loadOllamaModels: () => Promise<void>;
}

export default function EmbeddingsPanel({
  config,
  setConfig,
  ollamaModels,
  ollamaLoading,
  ollamaError,
  loadOllamaModels,
}: Props) {
  const onProviderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as EmbeddingProvider;
    setConfig((prev) => ({
      ...prev,
      embedding_provider: provider,
      embedding_model:
        provider === EmbeddingProvider.DEFAULT ? "" : prev.embedding_model,
    }));

    if (provider === EmbeddingProvider.OLLAMA) {
      await loadOllamaModels();
    }

    if (isCloudEmbeddingProvider(provider)) {
      const entry = Object.entries(CLOUD_PROVIDERS).find(
        ([key]) => key === provider,
      )?.[1];
      setConfig((prev) => ({
        ...prev,
        embedding_model: entry?.models?.[0] ?? "",
      }));
    }
  };

  return (
    <>
      <div className="settings-section-label">VECTOR ENGINE</div>
      <div className="settings-group-card">
        <div className="settings-row">
          <div className="row-info">
            <label>Embedding Provider</label>
            <p>Choose the engine used to vectorize your documents.</p>
          </div>
          <div className="row-action">
            <select
              className="settings-select"
              value={config.embedding_provider}
              onChange={onProviderChange}
            >
              <option value={EmbeddingProvider.DEFAULT}>Default</option>
              <option value={EmbeddingProvider.OLLAMA}>Ollama</option>
              <option value={EmbeddingProvider.OPENAI}>OpenAI</option>
              <option value={EmbeddingProvider.COHERE}>Cohere</option>
              <option value={EmbeddingProvider.JINA}>Jina AI</option>
              <option value={EmbeddingProvider.VOYAGE}>Voyage AI</option>
            </select>
          </div>
        </div>

        {config.embedding_provider === EmbeddingProvider.OLLAMA && (
          <div className="settings-row">
            <div className="row-info">
              <label>Embedding Model</label>
              <p>Choose a model available from your local Ollama setup.</p>
            </div>
            <div className="row-action">
              <div className="settings-select-wrapper">
                <div className="settings-select-group">
                  <select
                    className="settings-select settings-select--ollama"
                    value={config.embedding_model}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        embedding_model: e.target.value,
                      }))
                    }
                    disabled={ollamaLoading || ollamaModels.length === 0}
                  >
                    <option value="" disabled>
                      {ollamaLoading
                        ? "Loading Ollama models..."
                        : ollamaModels.length > 0
                          ? "Select a model"
                          : "No Ollama models found"}
                    </option>
                    {ollamaModels.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-secondary btn-secondary--small"
                    onClick={loadOllamaModels}
                    disabled={ollamaLoading}
                  >
                    Refresh
                  </button>
                </div>
                <div className="settings-help-text-container">
                  <div className="settings-help-text">
                    {ollamaError ||
                      (!ollamaLoading && ollamaModels.length === 0
                        ? "No Ollama models found. Confirm your local Ollama instance is running and refresh."
                        : "")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCloudEmbeddingProvider(config.embedding_provider) && (
          <>
            <div className="settings-row">
              <div className="row-info">
                <label>Model</label>
                <p>
                  {(() => {
                    const entry = Object.entries(CLOUD_PROVIDERS).find(
                      ([key]) => key === config.embedding_provider,
                    )?.[1];
                    return entry && entry.models.length > 0
                      ? `Choose a ${entry.label} embedding model.`
                      : `Enter the ${entry?.label ?? "cloud"} embedding model name.`;
                  })()}
                </p>
              </div>
              <div className="row-action">
                {(() => {
                  const entry = Object.entries(CLOUD_PROVIDERS).find(
                    ([key]) => key === config.embedding_provider,
                  )?.[1];
                  const models = entry?.models ?? [];
                  if (models.length > 0) {
                    return (
                      <select
                        className="settings-select"
                        value={config.embedding_model}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            embedding_model: e.target.value,
                          }))
                        }
                      >
                        {models.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    );
                  }

                  const providerLabel =
                    Object.entries(CLOUD_PROVIDERS).find(
                      ([key]) => key === config.embedding_provider,
                    )?.[1].label ?? "cloud";
                  return (
                    <input
                      className="settings-input"
                      type="text"
                      value={config.embedding_model}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          embedding_model: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${providerLabel} model name`}
                    />
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {config.embedding_provider !== EmbeddingProvider.OLLAMA &&
          !isCloudEmbeddingProvider(config.embedding_provider) && (
            <div className="settings-row">
              <div className="row-info">
                <label>Embedding Model</label>
                <p>Default mode uses the built-in model.</p>
              </div>
              <div className="row-action">
                <input
                  className="settings-input"
                  type="text"
                  value={config.embedding_model}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      embedding_model: e.target.value,
                    }))
                  }
                  placeholder={
                    config.embedding_provider === EmbeddingProvider.DEFAULT
                      ? "Default model"
                      : "all-MiniLM-L6-v2"
                  }
                  disabled={
                    config.embedding_provider === EmbeddingProvider.DEFAULT
                  }
                />
              </div>
            </div>
          )}

        <div className="settings-row" style={{ borderBottom: "none" }}>
          <div className="row-info">
            <label>API Key</label>
            <p>Required only if using a Cloud provider.</p>
          </div>
          <div className="row-action">
            <input
              className="settings-input"
              type="password"
              value={config.api_key}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, api_key: e.target.value }))
              }
              placeholder={
                isCloudEmbeddingProvider(config.embedding_provider)
                  ? "sk..."
                  : "Disabled"
              }
              disabled={!isCloudEmbeddingProvider(config.embedding_provider)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
