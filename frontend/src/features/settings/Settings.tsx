import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Cpu,
  Sparkles,
  Folder,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import "./Settings.css";
import { fetchAppConfig } from "../../api/config";
import { AppConfigBase } from "../../types/config";
import { EmbeddingProvider } from "../../enums/config";

type Tab =
  | "Search"
  | "Embeddings"
  | "AI Agent"
  | "Library"
  | "Sync"
  | "Privacy";

export default function Settings() {
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState<Tab>("Library");

  // User's Form State
  // const [includeSubfolders, setIncludeSubfolders] = useState(true);
  // const [allowedExtensions, setAllowedExtensions] = useState<string[]>([
  //   ".pdf",
  //   ".docx",
  //   ".txt",
  // ]);
  // const [embeddingProvider, setEmbeddingProvider] = useState("default");
  // const [embeddingModel, setEmbeddingModel] = useState("");
  // const [apiKey, setApiKey] = useState("");

  const [config, setConfig] = useState<AppConfigBase>({
    target_directory: "",
    include_subfolders: false,
    allowed_extensions: [".pdf", ".docx", ".txt"],
    embedding_provider: "default",
    embedding_model: "",
    api_key: "",
  });

  const toggleExtension = (ext: string) => {
    setConfig((prev) => ({
      ...prev,
      allowed_extensions: prev.allowed_extensions.includes(ext)
        ? prev.allowed_extensions.filter((item) => item !== ext)
        : [...prev.allowed_extensions, ext],
    }));
  };

  const loadConfig = async () => {
    try {
      const config = await fetchAppConfig();
      if (config) {
        setConfig(config);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleContinue = async () => {
    return;
  };
  const TABS: { name: Tab; icon: ReactNode }[] = [
    { name: "Search", icon: <Search size={16} /> },
    { name: "Embeddings", icon: <Cpu size={16} /> },
    { name: "AI Agent", icon: <Sparkles size={16} /> },
    { name: "Library", icon: <Folder size={16} /> },
    { name: "Sync", icon: <RefreshCcw size={16} /> },
    { name: "Privacy", icon: <ShieldAlert size={16} /> },
  ];

  return (
    <div className="settings-overlay">
      <div className="settings-container">
        {/* LEFT SIDEBAR */}
        <div className="settings-sidebar">
          <div className="sidebar-header">SETTINGS</div>
          <nav className="sidebar-nav">
            {TABS.map((tab) => (
              <button
                key={tab.name}
                className={`nav-item ${activeTab === tab.name ? "active" : ""}`}
                onClick={() => setActiveTab(tab.name)}
              >
                <span className="nav-icon">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="settings-content-wrapper">
          {/* Header */}
          <div className="settings-content-header">
            <h2>{activeTab}</h2>
            <button
              className="btn-close-modal"
              onClick={() => navigate("/dashboard")}
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="settings-scroll-area">
            {/* === LIBRARY TAB === */}
            {activeTab === "Library" && (
              <>
                <div className="settings-section-label">INDEXING</div>
                <div className="settings-group-card">
                  <div className="settings-row">
                    <div className="row-info">
                      <label>Target Directory</label>
                      <p>The root folder Mole will scan for documents.</p>
                    </div>
                    <div className="row-action">
                      <div className="input-with-button">
                        <input
                          className="settings-input"
                          type="text"
                          value={config.target_directory}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              target_directory: e.target.value,
                            }))
                          }
                          placeholder="Select directory..."
                        />
                        <button className="btn-secondary">Browse</button>
                      </div>
                    </div>
                  </div>

                  <div className="settings-row">
                    <div className="row-info">
                      <label>Include Subfolders</label>
                      <p>
                        Scan all nested folders inside the target directory.
                      </p>
                    </div>
                    <div className="row-action">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={config.include_subfolders}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              include_subfolders: e.target.checked,
                            }))
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-section-label">FILE TYPES</div>
                <div className="settings-group-card">
                  <div
                    className="settings-row"
                    style={{
                      borderBottom: "none",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <div className="row-info" style={{ marginBottom: "12px" }}>
                      <label>Allowed Extensions</label>
                      <p>
                        Only files with these extensions will be vectorized.
                      </p>
                    </div>
                    <div className="settings-chip-group">
                      {[".pdf", ".docx", ".txt", ".md", ".csv"].map((ext) => (
                        <button
                          key={ext}
                          type="button"
                          className={`settings-chip ${config.allowed_extensions.includes(ext) ? "selected" : ""}`}
                          onClick={() => toggleExtension(ext)}
                        >
                          {ext}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* === EMBEDDINGS TAB === */}
            {activeTab === "Embeddings" && (
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
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            embedding_provider: e.target
                              .value as EmbeddingProvider,
                          }))
                        }
                      >
                        <option value={EmbeddingProvider.DEFAULT}>
                          Built-in
                        </option>
                        <option value={EmbeddingProvider.OLLAMA}>Ollama</option>
                        <option value={EmbeddingProvider.CLOUD}>
                          Cloud API
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="settings-row">
                    <div className="row-info">
                      <label>Embedding Model</label>
                      <p>The specific model name (e.g. nomic-embed-text).</p>
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
                        placeholder="all-MiniLM-L6-v2"
                      />
                    </div>
                  </div>

                  <div
                    className="settings-row"
                    style={{ borderBottom: "none" }}
                  >
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
                          setConfig((prev) => ({
                            ...prev,
                            api_key: e.target.value,
                          }))
                        }
                        placeholder="sk-..."
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Placeholder for other tabs */}
            {!["Library", "Embeddings"].includes(activeTab) && (
              <div className="empty-tab-state">
                <p>Settings for {activeTab} will appear here.</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="settings-footer">
            <button
              className="btn-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleContinue}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
