import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useNavigate } from "react-router-dom";
import DirectoryStep from "./DirectoryStep";
import EngineStep from "./EngineStep";
import "./Setup.css";
import { saveConfig } from "../../api/config";
import { EmbeddingProvider } from "../../enums/config";
import { fetchOllamaModels } from "../../api/ollama";
import { useToast } from "../../components/ToastProvider";
import { OllamaModel } from "../../types/ollama";

const FILE_TYPES = [".pdf", ".docx", ".txt"];
const PROVIDERS = ["OpenAI", "Jina AI"];

type SetupStep = 1 | 2;

interface SetupState {
  targetDir: string;
  includeSubfolders: boolean;
  fileTypes: string[];
  engineOption: EmbeddingProvider;
  ollamaModel: string;
  cloudProvider: string;
  apiKey: string;
}

export default function Setup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>(1);
  const [setup, setSetup] = useState<SetupState>({
    targetDir: "",
    includeSubfolders: true,
    fileTypes: FILE_TYPES,
    engineOption: EmbeddingProvider.DEFAULT,
    ollamaModel: "",
    cloudProvider: PROVIDERS[0],
    apiKey: "",
  });

  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const { showToast } = useToast();
  const getOllamaModels = async () => {
    setOllamaLoading(true);
    setOllamaError(null);
    try {
      const models = await fetchOllamaModels();
      setOllamaModels(models);
      if (!models || models.length === 0) {
        showToast("No Ollama models found.", "info");
      }
    } catch (error: any) {
      console.error(error);
      const msg = (error && error.message) || "Failed to connect to Ollama.";
      setOllamaError(msg);
      showToast(`Failed to connect to Ollama: ${msg}`, "error");
    } finally {
      setOllamaLoading(false);
    }
  };
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

    let model = "all-MiniLM-L6-v2";
    if (setup.engineOption === EmbeddingProvider.OLLAMA) {
      model = setup.ollamaModel;
    } else if (setup.engineOption === EmbeddingProvider.CLOUD) {
      model = setup.cloudProvider;
    }

    try {
      await saveConfig({
        target_directory: setup.targetDir,
        include_subfolders: setup.includeSubfolders,
        allowed_extensions: setup.fileTypes,
        embedding_provider: setup.engineOption,
        embedding_model: model,
        api_key: setup.apiKey,
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
              engineOption={setup.engineOption}
              ollamaModel={setup.ollamaModel}
              provider={setup.cloudProvider}
              apiKey={setup.apiKey}
              onSelectEngine={async (value) => {
                setSetup((prev) => ({ ...prev, engineOption: value }));
                if (value === EmbeddingProvider.OLLAMA) {
                  await getOllamaModels();
                }
              }}
              onChangeOllamaModel={(value) =>
                setSetup((prev) => ({ ...prev, ollamaModel: value }))
              }
              onChangeProvider={(value) =>
                setSetup((prev) => ({ ...prev, cloudProvider: value }))
              }
              onChangeApiKey={(value) =>
                setSetup((prev) => ({ ...prev, apiKey: value }))
              }
              availableOllamaModels={ollamaModels}
              ollamaLoading={ollamaLoading}
              onRequestModels={getOllamaModels}
            />
          )}

          <div className="setup-footer">
            <button className="btn-back" onClick={handleBack}>
              Back
            </button>
            <button
              className="btn-continue"
              disabled={
                step === 1
                  ? !setup.targetDir
                  : setup.engineOption === EmbeddingProvider.OLLAMA
                    ? ollamaLoading || ollamaModels.length === 0
                    : false
              }
              title={
                step === 2 &&
                setup.engineOption === EmbeddingProvider.OLLAMA &&
                (ollamaLoading
                  ? "Connecting to Ollama..."
                  : ollamaModels.length === 0
                    ? "No Ollama models available — cannot save"
                    : "")
              }
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
