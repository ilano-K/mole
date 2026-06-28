import { Folder } from "lucide-react";
import FileTypeSelector from "../../components/FileTypeSelector";

const FILE_TYPES = [".pdf", ".docx", ".txt"];

interface DirectoryStepProps {
  targetDir: string;
  includeSubfolders: boolean;
  fileTypes: string[];
  onSelectFolder: () => Promise<void>;
  onToggleSubfolders: (value: boolean) => void;
  onToggleFileType: (ext: string) => void;
}

export default function DirectoryStep({
  targetDir,
  includeSubfolders,
  fileTypes,
  onSelectFolder,
  onToggleSubfolders,
  onToggleFileType,
}: DirectoryStepProps) {
  return (
    <div className="setup-body">
      <button className="directory-selector" onClick={onSelectFolder}>
        <Folder size={18} className="icon-blue" />
        <span>{targetDir ? targetDir : "Click to select folder"}</span>
      </button>

      <div className="toggle-row-container">
        <span className="toggle-label">Include Subfolders</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={includeSubfolders}
            onChange={(e) => onToggleSubfolders(e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <FileTypeSelector
        fileTypes={FILE_TYPES}
        selected={fileTypes}
        onToggle={onToggleFileType}
      />
    </div>
  );
}
