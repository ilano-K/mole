import { SearchResult } from "../../types/document";

interface SearchResultCardProps {
  result: SearchResult;
  isActive?: boolean;
  showPin?: boolean;
  showChevron?: boolean;
  onPin?: () => void;
}

const typeMetadata: Record<string, { icon: string; badge: string }> = {
  pdf: { icon: "📄", badge: "PDF" },
  docx: { icon: "📝", badge: "DOCX" },
  doc: { icon: "📝", badge: "DOC" },
  txt: { icon: "📃", badge: "TXT" },
  md: { icon: "📄", badge: "MD" },
  xlsx: { icon: "📊", badge: "XLSX" },
  xls: { icon: "📊", badge: "XLS" },
  csv: { icon: "📑", badge: "CSV" },
  pptx: { icon: "📈", badge: "PPTX" },
  ppt: { icon: "📈", badge: "PPT" },
  png: { icon: "🖼️", badge: "PNG" },
  jpg: { icon: "🖼️", badge: "JPG" },
  jpeg: { icon: "🖼️", badge: "JPEG" },
  gif: { icon: "🖼️", badge: "GIF" },
  json: { icon: "🧾", badge: "JSON" },
  html: { icon: "🌐", badge: "HTML" },
  default: { icon: "📄", badge: "FILE" },
};

const getResultTypeMeta = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return (
    typeMetadata[extension] ?? {
      icon: "📄",
      badge: extension ? extension.toUpperCase() : "FILE",
    }
  );
};

export default function SearchResultCard({
  result,
  isActive,
  showPin = false,
  showChevron = false,
  onPin,
}: SearchResultCardProps) {
  const { icon, badge } = getResultTypeMeta(result.filename);

  return (
    <div className={`result-card ${isActive ? "active" : ""}`}>
      <div className={`result-icon icon-${badge.toLowerCase()}`}>{icon}</div>

      <div className="result-content">
        <div className="result-title-row">
          <span className="result-title">{result.filename}</span>
          <span className="result-badge">{badge}</span>
        </div>
        <div className="result-excerpt">{result.excerpt}</div>
        <div className="result-path">{result.file_path}</div>
      </div>

      {showPin && onPin ? (
        <button className="btn-pin" title="Pin to AI Context" onClick={onPin}>
          +
        </button>
      ) : null}

      {showChevron ? <div className="result-arrow">❯</div> : null}
    </div>
  );
}
