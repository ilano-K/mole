import { SearchResult } from "../../types/document";
import { openPath } from "@tauri-apps/plugin-opener";
import {
  FileText,
  FileSpreadsheet,
  Image,
  FileJson,
  Globe2,
  File,
  type LucideIcon,
} from "lucide-react";
import "./SearchResultCard.css";

interface SearchResultCardProps {
  result: SearchResult;
  isActive?: boolean;
  showPin?: boolean;
  showChevron?: boolean;
  onPin?: () => void;
  showOpen?: boolean;
  onOpen?: () => void;
}

const typeMetadata: Record<
  string,
  { icon: LucideIcon; badge: string; color: string }
> = {
  pdf: { icon: FileText, badge: "PDF", color: "#fb7185" },
  docx: { icon: FileText, badge: "DOCX", color: "#60a5fa" },
  doc: { icon: FileText, badge: "DOC", color: "#60a5fa" },
  txt: { icon: FileText, badge: "TXT", color: "#38bdf8" },
  md: { icon: FileText, badge: "MD", color: "#8b5cf6" },
  xlsx: { icon: FileSpreadsheet, badge: "XLSX", color: "#22c55e" },
  xls: { icon: FileSpreadsheet, badge: "XLS", color: "#22c55e" },
  csv: { icon: FileSpreadsheet, badge: "CSV", color: "#fbbf24" },
  pptx: { icon: FileText, badge: "PPTX", color: "#fb923c" },
  ppt: { icon: FileText, badge: "PPT", color: "#fb923c" },
  png: { icon: Image, badge: "PNG", color: "#60a5fa" },
  jpg: { icon: Image, badge: "JPG", color: "#60a5fa" },
  jpeg: { icon: Image, badge: "JPEG", color: "#60a5fa" },
  gif: { icon: Image, badge: "GIF", color: "#60a5fa" },
  json: { icon: FileJson, badge: "JSON", color: "#22d3ee" },
  html: { icon: Globe2, badge: "HTML", color: "#38bdf8" },
  default: { icon: File, badge: "FILE", color: "#94a3b8" },
};

const getResultTypeMeta = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return (
    typeMetadata[extension] ?? {
      icon: File,
      badge: extension ? extension.toUpperCase() : "FILE",
      color: "#94a3b8",
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
  const { icon: ResultIcon, badge, color } = getResultTypeMeta(result.filename);
  const distance = Number.isFinite(result.distance) ? result.distance : 1;
  const matchScore = getMatchScore(distance);
  const matchLevel = getMatchLevel(distance);

  return (
    <div className={`search-result-card ${isActive ? "active" : ""}`}>
      <div
        className="search-result-icon"
        style={{ backgroundColor: `${color}16`, color }}
      >
        <ResultIcon size={20} />
      </div>

      <div className="search-result-content">
        <div className="search-result-title-row">
          <span className="search-result-title">{result.filename}</span>
          <span className="search-result-badge">{badge}</span>
        </div>
        <div className="search-result-excerpt">{result.excerpt}</div>

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
