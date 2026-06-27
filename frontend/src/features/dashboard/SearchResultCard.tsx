import { SearchResult } from "../../types/document";
import { openPath } from "@tauri-apps/plugin-opener";

interface SearchResultCardProps {
  result: SearchResult;
  isActive?: boolean;
  showPin?: boolean;
  showChevron?: boolean;
  onPin?: () => void;
  showOpen?: boolean;
  onOpen?: () => void;
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

const getMatchScore = (distance: number) => {
  const normalized = Math.max(0, Math.min(1, 1 - distance / 2));
  return Math.round(normalized * 100);
};

const getMatchLevel = (distance: number) => {
  const score = getMatchScore(distance);
  if (score >= 85) return { label: "Excellent", color: "#22c55e" };
  if (score >= 70) return { label: "Strong", color: "#3b82f6" };
  if (score >= 45) return { label: "Moderate", color: "#f97316" };
  return { label: "Weak", color: "#ef4444" };
};

export default function SearchResultCard({
  result,
  isActive,
  showPin = false,
  showChevron = false,
  showOpen = true,
  onPin,
  onOpen,
}: SearchResultCardProps) {
  const { icon, badge } = getResultTypeMeta(result.filename);
  const matchScore = getMatchScore(result.distance);
  const matchLevel = getMatchLevel(result.distance);

  return (
    <div className={`result-card ${isActive ? "active" : ""}`}>
      <div className={`result-icon icon-${badge.toLowerCase()}`}>{icon}</div>

      <div className="result-content">
        <div className="result-title-row">
          <span className="result-title">{result.filename}</span>
          <span className="result-badge">{badge}</span>
        </div>
        <div className="result-excerpt">{result.excerpt}</div>

        <div className="match-row">
          <div className="match-bar-track">
            <div
              className="match-bar-fill"
              style={{
                width: `${matchScore}%`,
                backgroundColor: matchLevel.color,
              }}
            />
          </div>
          <span className="match-text" style={{ color: matchLevel.color }}>
            {matchLevel.label.toLowerCase()} match
          </span>
          <span className="match-percent">{matchScore}%</span>
        </div>

        <div className="result-path">{result.file_path}</div>
      </div>

      {showOpen ? (
        <button
          className="btn-open"
          title="Open file"
          aria-label={`Open ${result.filename}`}
          onClick={async () => {
            try {
              if (onOpen) {
                await onOpen();
              } else {
                await openPath(result.file_path);
              }
            } catch (err) {
              console.error("Failed to open path:", err);
            }
          }}
        >
          <span className="btn-open-icon" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="15 3 21 3 21 9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="10"
                y1="14"
                x2="21"
                y2="3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      ) : null}

      {showPin && onPin ? (
        <button className="btn-pin" title="Pin to AI Context" onClick={onPin}>
          +
        </button>
      ) : null}

      {showChevron ? <div className="result-arrow">❯</div> : null}
    </div>
  );
}
