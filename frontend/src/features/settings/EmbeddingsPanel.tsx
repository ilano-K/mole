import React from "react";
import { AppConfigBase } from "../../types/config";
import { EmbeddingProvider } from "../../enums/config";
import { OllamaModel } from "../../types/ollama";
import { CLOUD_PROVIDERS } from "../../constants/embeddingProvider";

interface Props {
  config: AppConfigBase;
  setConfig: React.Dispatch<React.SetStateAction<AppConfigBase>>;
  cloudProvider: string;
  setCloudProvider: React.Dispatch<React.SetStateAction<string>>;
  ollamaModels: OllamaModel[];
  ollamaLoading: boolean;
  ollamaError: string;
  loadOllamaModels: () => Promise<void>;
}

export default function EmbeddingsPanel({
  config,
  setConfig,
  cloudProvider,
  setCloudProvider,
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
      embedding_model: provider === EmbeddingProvider.DEFAULT ? "" : prev.embedding_model,
    }));

    if (provider === EmbeddingProvider.OLLAMA) {
      await loadOllamaModels();
    }

    if (provider === EmbeddingProvider.CLOUD) {
      const first = Object.values(CLOUD_PROVIDERS)[0];
      setCloudProvider(first?.label ?? "");
      setConfig((prev) => ({ ...prev, embedding_model: first?.models?.[0] ?? "" }));
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
            <select className="settings-select" value={config.embedding_provider} onChange={onProviderChange}>
              <option value={EmbeddingProvider.DEFAULT}>Default</option>
              <option value={EmbeddingProvider.OLLAMA}>Ollama</option>
              <option value={EmbeddingProvider.CLOUD}>Cloud API</option>
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
                    onChange={(e) => setConfig((prev) => ({ ...prev, embedding_model: e.target.value }))}
                    disabled={ollamaLoading || ollamaModels.length === 0}
                  >
                    <option value="" disabled>
                      {ollamaLoading ? "Loading Ollama models..." : ollamaModels.length > 0 ? "Select a model" : "No Ollama models found"}
                    </option>
                    {ollamaModels.map((m) => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <button type="button" className="btn-secondary btn-secondary--small" onClick={loadOllamaModels} disabled={ollamaLoading}>
                    Refresh
                  </button>
                </div>
                <div className="settings-help-text-container">
                  <div className="settings-help-text">
                    {ollamaError || (!ollamaLoading && ollamaModels.length === 0 ? "No Ollama models found. Confirm your local Ollama instance is running and refresh." : "")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {config.embedding_provider === EmbeddingProvider.CLOUD && (
          <>
            <div className="settings-row">
              <div className="row-info">
                <label>Embedding Model</label>
                <p>Choose a cloud model and provider.</p>
              </div>
              <div className="row-action">
                <div style={{ opacity: 0.9, fontSize: "0.95rem" }}>Select provider and model below.</div>
              </div>
            </div>

            <div className="settings-row">
              <div className="row-info">
                <label>Provider</label>
                <p>Select the cloud API provider for embeddings.</p>
              </div>
              <div className="row-action">
                <select
                  className="settings-select"
                  value={cloudProvider}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setCloudProvider(selected);
                    const entry = Object.values(CLOUD_PROVIDERS).find((p) => p.label === selected);
                    setConfig((prev) => ({ ...prev, embedding_model: entry?.models?.[0] ?? "" }));
                  }}
                >
                  {Object.values(CLOUD_PROVIDERS).map((p) => (
                    <option key={p.label} value={p.label}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="settings-row">
              <div className="row-info">
                <label>Model</label>
                <p>
                  {(() => {
                    const entry = Object.values(CLOUD_PROVIDERS).find((p) => p.label === cloudProvider);
                    return entry && entry.models.length > 0 ? `Choose a ${cloudProvider} embedding model.` : `Enter the ${cloudProvider} embedding model name.`;
                  })()}
                </p>
              </div>
              <div className="row-action">
                {(() => {
                  const entry = Object.values(CLOUD_PROVIDERS).find((p) => p.label === cloudProvider);
                  const models = entry?.models ?? [];
                  if (models.length > 0) {
                    return (
                      <select className="settings-select" value={config.embedding_model} onChange={(e) => setConfig((prev) => ({ ...prev, embedding_model: e.target.value }))}>
                        {models.map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    );
                  }

                  return (
                    <input className="settings-input" type="text" value={config.embedding_model} onChange={(e) => setConfig((prev) => ({ ...prev, embedding_model: e.target.value }))} placeholder={`Enter ${cloudProvider} model name`} />
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {config.embedding_provider !== EmbeddingProvider.OLLAMA && config.embedding_provider !== EmbeddingProvider.CLOUD && (
          <div className="settings-row">
            <div className="row-info">
              <label>Embedding Model</label>
              <p>Default mode uses the built-in model.</p>
            </div>
            <div className="row-action">
              <input className="settings-input" type="text" value={config.embedding_model} onChange={(e) => setConfig((prev) => ({ ...prev, embedding_model: e.target.value }))} placeholder={config.embedding_provider === EmbeddingProvider.DEFAULT ? "Default model" : "all-MiniLM-L6-v2"} disabled={config.embedding_provider === EmbeddingProvider.DEFAULT} />
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
              onChange={(e) => setConfig((prev) => ({ ...prev, api_key: e.target.value }))}
              placeholder={config.embedding_provider === EmbeddingProvider.CLOUD ? "sk..." : "Disabled"}
              disabled={config.embedding_provider !== EmbeddingProvider.CLOUD}
            />
          </div>
        </div>
      </div>
    </>
  );
}
