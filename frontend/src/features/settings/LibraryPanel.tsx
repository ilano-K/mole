import React from "react";
import { AppConfigBase } from "../../types/config";

interface Props {
  config: AppConfigBase;
  setConfig: React.Dispatch<React.SetStateAction<AppConfigBase>>;
  selectDirectory: () => Promise<void>;
  toggleExtension: (ext: string) => void;
}

export default function LibraryPanel({
  config,
  setConfig,
  selectDirectory,
  toggleExtension,
}: Props) {
  return (
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
              <button className="btn-secondary" onClick={selectDirectory}>
                Browse
              </button>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="row-info">
            <label>Include Subfolders</label>
            <p>Scan all nested folders inside the target directory.</p>
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
            <p>Only files with these extensions will be vectorized.</p>
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
  );
}
