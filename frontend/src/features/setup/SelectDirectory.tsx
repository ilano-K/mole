import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Folder, FileText, CheckSquare, Square } from "lucide-react";

export default function SelectDirectory() {
  const [targetDir, setTargetDir] = useState<string>("");
  const [includeSubfolders, setIncludeSubfolders] = useState<boolean>(true);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([
    ".pdf",
    ".docx",
    ".txt",
  ]);

  const availableFormats = [".pdf", ".docx", ".txt"];

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Document Directory",
      });
      if (selected && typeof selected === "string") {
        setTargetDir(selected);
      }
    } catch (error) {
      console.error("Failed to open dialog:", error);
    }
  };

  const handleTypeToggle = (ext: string) => {
    setSelectedFileTypes((prev) =>
      prev.includes(ext) ? prev.filter((t) => t !== ext) : [...prev, ext],
    );
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
        <button className="directory-selector" onClick={handleSelectFolder}>
          <Folder size={18} className="icon-blue" />
          <span>{targetDir ? targetDir : "Click to select folder"}</span>
        </button>

        {/* Subfolders Toggle Row */}
        <div className="toggle-row-container">
          <span className="toggle-label">Include Subfolders</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={includeSubfolders}
              onChange={(e) => setIncludeSubfolders(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* File Types Selection */}
        <div className="file-types-section">
          <label className="section-label">File Types</label>
          <div className="file-types-grid">
            {availableFormats.map((ext) => {
              const isSelected = selectedFileTypes.includes(ext);
              return (
                <button
                  key={ext}
                  className={`file-type-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleTypeToggle(ext)}
                >
                  {isSelected ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} className="text-muted" />
                  )}
                  <FileText size={16} />
                  <span>{ext}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="setup-footer">
        <button className="btn-back">Back</button>
        <button className="btn-continue" disabled={!targetDir}>
          Continue
        </button>
      </div>
    </div>
  );
}
