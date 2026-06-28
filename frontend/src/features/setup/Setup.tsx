import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useNavigate } from "react-router-dom";
import DirectoryStep from "./DirectoryStep";
import EngineStep from "./EngineStep";
import { saveConfig } from "../../api/config";

const FILE_TYPES = [".pdf", ".docx", ".txt"];
const OLLAMA_MODELS = ["nomic-embed-text", "mxbai-embed-large"];
const PROVIDERS = ["OpenAI", "Jina AI"];

type SetupStep = 1 | 2;
type EngineOption = "builtin" | "ollama" | "cloud";

export default function Setup() {
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
            <DirectoryStep
              targetDir={setup.targetDir}
              includeSubfolders={setup.includeSubfolders}
              fileTypes={setup.fileTypes}
              onSelectFolder={selectFolder}
              onToggleSubfolders={(value) =>
                setSetup((prev) => ({ ...prev, includeSubfolders: value }))
              }
              onToggleFileType={toggleFileType}
            />
          ) : (
            <EngineStep
              engineOption={engineOption}
              ollamaModel={ollamaModel}
              provider={provider}
              apiKey={apiKey}
              onSelectEngine={setEngineOption}
              onChangeOllamaModel={setOllamaModel}
              onChangeProvider={setProvider}
              onChangeApiKey={setApiKey}
            />
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
