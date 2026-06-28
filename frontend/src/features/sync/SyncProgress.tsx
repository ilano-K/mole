import "./SyncProgress.css";

// We define props so you can easily feed real data from FastAPI into this UI later!
interface SyncProgressProps {
  totalFiles?: number;
  indexedFiles?: number;
  currentFileName?: string;
}

export default function SyncProgress({
  totalFiles = 127,
  indexedFiles = 55,
  currentFileName = "Data_Privacy_Act_Summary.txt",
}: SyncProgressProps = {}) {
  // Calculate the dynamic numbers
  const remainingFiles = totalFiles - indexedFiles;
  const progressPercentage =
    totalFiles > 0 ? Math.round((indexedFiles / totalFiles) * 100) : 0;

  return (
    <div className="sync-container">
      <div className="sync-card">
        {/* HEADER & ICON */}
        <div className="sync-header">
          <div className="sync-icon-wrapper">
            {/* Custom SVG matching your mockup's document icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h2 className="sync-title">Initial Sync in Progress</h2>
          <p className="sync-subtitle">
            Reading and vectorizing your selected folder
          </p>
        </div>

        {/* PROGRESS BAR SECTION */}
        <div className="sync-progress-section">
          <div className="progress-track">
            {/* The width of this div is dynamically controlled by React! */}
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-labels">
            <span className="progress-count">
              {indexedFiles} of {totalFiles} files
            </span>
            <span className="progress-percent">{progressPercentage}%</span>
          </div>
        </div>

        {/* CURRENT FILE BOX */}
        <div className="current-file-box">
          <span className="current-file-label">Currently processing</span>
          <span className="current-file-name">{currentFileName}</span>
        </div>

        {/* STATS GRID */}
        <div className="sync-stats-grid">
          <div className="stat-card">
            <span className="stat-value stat-blue">{totalFiles}</span>
            <span className="stat-label">Files Found</span>
          </div>
          <div className="stat-card">
            <span className="stat-value stat-green">{indexedFiles}</span>
            <span className="stat-label">Indexed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value stat-orange">{remainingFiles}</span>
            <span className="stat-label">Remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
}
