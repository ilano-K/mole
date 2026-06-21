import { FileText, CheckSquare, Square } from "lucide-react";

type Props = {
  fileTypes: string[];
  selected: string[];
  onToggle: (ext: string) => void;
};

export default function FileTypeSelector({
  fileTypes,
  selected,
  onToggle,
}: Props) {
  return (
    <div className="file-types-section">
      <label className="section-label">File Types</label>

      <div className="file-types-grid">
        {fileTypes.map((ext) => {
          const isSelected = selected.includes(ext);

          return (
            <button
              key={ext}
              type="button"
              className={`file-type-card ${isSelected ? "active" : ""}`}
              onClick={() => onToggle(ext)}
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
  );
}
