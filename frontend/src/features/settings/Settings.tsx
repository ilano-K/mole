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
import { open } from "@tauri-apps/plugin-dialog";
import "./Settings.css";
import { fetchAppConfig, saveConfig } from "../../api/config";
import { fetchOllamaModels } from "../../api/ollama";
import { AppConfigBase } from "../../types/config";
import { OllamaModel } from "../../types/ollama";
import {
  EmbeddingProvider,
  isCloudEmbeddingProvider,
} from "../../enums/config";
import { useToast } from "../../components/ToastProvider";
import LibraryPanel from "./LibraryPanel";
import EmbeddingsPanel from "./EmbeddingsPanel";

type Tab =
  | "Search"
  | "Embeddings"
  | "AI Agent"
  | "Library"
  | "Sync"
  | "Privacy";

export default function Settings() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("Library");
  const [originalConfig, setOriginalConfig] = useState<AppConfigBase | null>(
    null,
  );

  const [config, setConfig] = useState<AppConfigBase>({
    target_directory: "",
    include_subfolders: false,
    allowed_extensions: [".pdf", ".docx", ".txt"],
    embedding_provider: "default",
    embedding_model: "",
    api_key: "",
    needs_reindex: false,
  });

  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string>("");

  const toggleExtension = (ext: string) => {
    setConfig((prev) => ({
      ...prev,
      allowed_extensions: prev.allowed_extensions.includes(ext)
        ? prev.allowed_extensions.filter((item) => item !== ext)
        : [...prev.allowed_extensions, ext],
    }));
  };

  const loadOllamaModels = async () => {
    try {
      setOllamaLoading(true);
      setOllamaError("");
      const response = await fetchOllamaModels();
      setOllamaModels(response.models);
    } catch (error) {
      console.error("Error loading Ollama models:", error);
      setOllamaError("Unable to load Ollama models.");
      setOllamaModels([]);
    } finally {
      setOllamaLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const cfg = await fetchAppConfig();
      if (cfg) {
        setOriginalConfig(cfg);
        setConfig(cfg);
        if (cfg.embedding_provider === EmbeddingProvider.OLLAMA) {
          await loadOllamaModels();
        }
        if (isCloudEmbeddingProvider(cfg.embedding_provider)) {
          // Provider is already set in config
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const selectDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Target Directory",
      });

      if (typeof selected === "string") {
        setConfig((prev) => ({
          ...prev,
          target_directory: selected,
        }));
      }
    } catch (error) {
      console.error("Failed to open directory picker:", error);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleContinue = async () => {
    const needsReindex =
      originalConfig?.target_directory !== config.target_directory ||
      originalConfig?.include_subfolders !== config.include_subfolders ||
      originalConfig?.embedding_provider !== config.embedding_provider ||
      originalConfig?.embedding_model !== config.embedding_model ||
      JSON.stringify(originalConfig?.allowed_extensions) !==
        JSON.stringify(config.allowed_extensions);
    try {
      await saveConfig({ ...config, needs_reindex: needsReindex });
      showToast("Settings saved successfully.", "success");
      try {
        window.dispatchEvent(new Event("config-updated"));
      } catch (err) {
        // ignore
      }
    } catch (error) {
      console.error(error);
      showToast("Could not save settings. Please try again.", "error");
    }
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

        <div className="settings-content-wrapper">
          <div className="settings-content-header">
            <h2>{activeTab}</h2>
            <button
              className="btn-close-modal"
              onClick={() => navigate("/dashboard")}
            >
              ✕
            </button>
          </div>

          <div className="settings-scroll-area">
            {activeTab === "Library" && (
              <LibraryPanel
                config={config}
                setConfig={setConfig}
                selectDirectory={selectDirectory}
                toggleExtension={toggleExtension}
              />
            )}

            {activeTab === "Embeddings" && (
              <EmbeddingsPanel
                config={config}
                setConfig={setConfig}
                ollamaModels={ollamaModels}
                ollamaLoading={ollamaLoading}
                ollamaError={ollamaError}
                loadOllamaModels={loadOllamaModels}
              />
            )}

            {!["Library", "Embeddings"].includes(activeTab) && (
              <div className="empty-tab-state">
                <p>Settings for {activeTab} will appear here.</p>
              </div>
            )}
          </div>

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
