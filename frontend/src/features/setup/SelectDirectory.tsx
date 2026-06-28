import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Folder } from "lucide-react";
import FileTypeSelector from "../../components/FileTypeSelector";
import { saveConfig } from "../../api/config";
import { useNavigate } from "react-router-dom";

const FILE_TYPES = [".pdf", ".docx", ".txt"];
const OLLAMA_MODELS = ["nomic-embed-text", "mxbai-embed-large"];
const PROVIDERS = ["OpenAI", "Jina AI"];

type SetupStep = 1 | 2;
type EngineOption = "builtin" | "ollama" | "cloud";

export default function SelectDirectory() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>(1);
  const [setup, setSetup] = useState({
    targetDir: "",
    includeSubfolders: true,
    fileTypes: FILE_TYPES,
  });
  const [engineOption, setEngineOption] = useState<EngineOption>("builtin");
  const [ollamaModel, setOllamaModel] = useState(OLLAMA_MODELS[0]);
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [apiKey, setApiKey] = useState("");

  const selectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Document Directory",
      });

      if (typeof selected === "string") {
        setSetup((prev) => ({
          ...prev,
          targetDir: selected,
        }));
      }
    } catch (error) {
      console.error("Failed to open dialog:", error);
    }
  };

  const toggleFileType = (ext: string) => {
    setSetup((prev) => ({
      ...prev,
      fileTypes: prev.fileTypes.includes(ext)
        ? prev.fileTypes.filter((t) => t !== ext)
        : [...prev.fileTypes, ext],
    }));
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }

    navigate(-1);
  };

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    try {
      await saveConfig({
        target_directory: setup.targetDir,
        include_subfolders: setup.includeSubfolders,
        allowed_extensions: setup.fileTypes,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="setup-modal-overlay">
      <div className="setup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="setup-card">
          <div className="setup-header">
            <div
              className="setup-step-indicator"
              aria-label={`Step ${step} of 2`}
            >
              <div className="step-item">
                <span className={`step-circle ${step === 1 ? "active" : ""}`}>
                  1
                </span>
                <span className="step-label">Directory</span>
              </div>
              <span className="step-divider" />
              <div className="step-item">
                <span className={`step-circle ${step === 2 ? "active" : ""}`}>
                  2
                </span>
                <span className="step-label">Engine</span>
              </div>
            </div>
            <h2 className="setup-title">
              {step === 1
                ? "Select Target Directory"
                : "Vector Engine Selection"}
            </h2>
            <p className="setup-subtitle">
              {step === 1
                ? "Choose the primary folder containing your documents and other files."
                : "Choose how embeddings are generated for your documents."}
            </p>
          </div>

          {step === 1 ? (
            <div className="setup-body">
              <button className="directory-selector" onClick={selectFolder}>
                <Folder size={18} className="icon-blue" />
                <span>
                  {setup.targetDir ? setup.targetDir : "Click to select folder"}
                </span>
              </button>

              <div className="toggle-row-container">
                <span className="toggle-label">Include Subfolders</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={setup.includeSubfolders}
                    onChange={(e) =>
                      setSetup((prev) => ({
                        ...prev,
                        includeSubfolders: e.target.checked,
                      }))
                    }
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <FileTypeSelector
                fileTypes={FILE_TYPES}
                selected={setup.fileTypes}
                onToggle={toggleFileType}
              />
            </div>
          ) : (
            <div className="setup-body">
              <div className="engine-options">
                <button
                  type="button"
                  className={`engine-option-card ${engineOption === "builtin" ? "selected" : ""}`}
                  onClick={() => setEngineOption("builtin")}
                >
                  <div className="engine-option-top">
                    <h3 className="engine-option-title">Mole Built-in</h3>
                    <span className="engine-badge">Default</span>
                  </div>
                  <p className="engine-option-subtext">
                    Fast, private, and works entirely offline out of the box.
                    Uses standard MiniLM.
                  </p>
                </button>

                <button
                  type="button"
                  className={`engine-option-card ${engineOption === "ollama" ? "selected" : ""}`}
                  onClick={() => setEngineOption("ollama")}
                >
                  <div className="engine-option-top">
                    <h3 className="engine-option-title">
                      Local Server (Ollama)
                    </h3>
                  </div>
                  <p className="engine-option-subtext">
                    Connect to your local Ollama instance for maximum privacy
                    and custom models.
                  </p>
                </button>

                <button
                  type="button"
                  className={`engine-option-card ${engineOption === "cloud" ? "selected" : ""}`}
                  onClick={() => setEngineOption("cloud")}
                >
                  <div className="engine-option-top">
                    <h3 className="engine-option-title">Cloud API</h3>
                  </div>
                  <p className="engine-option-subtext">
                    Use powerful cloud models. Requires an active internet
                    connection and API key.
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
                    onChange={(e) => setOllamaModel(e.target.value)}
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
                    onChange={(e) => setProvider(e.target.value)}
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
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                </div>
              )}
            </div>
          )}

          <div className="setup-footer">
            <button className="btn-back" onClick={handleBack}>
              Back
            </button>
            <button
              className="btn-continue"
              disabled={step === 1 ? !setup.targetDir : false}
              onClick={handleContinue}
            >
              {step === 1 ? "Continue" : "Complete Setup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
