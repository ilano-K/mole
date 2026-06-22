import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Folder } from "lucide-react";
import FileTypeSelector from "../../components/FileTypeSelector";
import { saveConfig } from "../../api/config";

const FILE_TYPES = [".pdf", ".docx", ".txt"];

export default function SelectDirectory() {
  const [setup, setSetup] = useState({
    targetDir: "",
    includeSubfolders: true,
    fileTypes: FILE_TYPES,
  });

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

  const handleContinue = async () => {
    try {
      await saveConfig({
        target_directory: setup.targetDir,
        include_subfolders: setup.includeSubfolders,
        allowed_extensions: setup.fileTypes,
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="setup-card">
      <div className="setup-header">
        <h2 className="setup-title">Select Target Directory</h2>
        <p className="setup-subtitle">
          Choose the primary folder containing your documents and other files.
        </p>
      </div>

      <div className="setup-body">
        {/* Large Folder Select Button */}
        <button className="directory-selector" onClick={selectFolder}>
          <Folder size={18} className="icon-blue" />
          <span>
            {setup.targetDir ? setup.targetDir : "Click to select folder"}
          </span>
        </button>

        {/* Subfolders Toggle Row */}
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

        {/* File Types Selection */}
        <FileTypeSelector
          fileTypes={FILE_TYPES}
          selected={setup.fileTypes}
          onToggle={toggleFileType}
        />
      </div>

      {/* Footer Actions */}
      <div className="setup-footer">
        <button className="btn-back">Back</button>
        <button
          className="btn-continue"
          disabled={!setup.targetDir}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
