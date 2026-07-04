import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Settings2, Sparkles } from "lucide-react";
import "./Dashboard.css";
import { resetIndex, searchDocument } from "../../api/document";
import LoadingScreen from "../../components/LoadingScreen";
import { useSync } from "../../hooks/useSync";
import { SearchResponse, SearchResult } from "../../types/document";
import SearchResultCard from "./SearchResultCard";
import { openPath } from "@tauri-apps/plugin-opener";
import SyncModal from "../sync/SyncModal";
import { fetchStatus } from "../../api/status";
import { FetchStatusResponse } from "../../types/status";

export default function Dashboard() {
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState("");
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, setIsSearching] = useState(false);
  const [needsReindex, setNeedsReindex] = useState(false);

  const navigate = useNavigate();
  const { totalFiles, indexedFiles, currentFileName, isComplete, startSync } =
    useSync();

  const applyStatus = (status: FetchStatusResponse) => {
    setPendingFiles(status.pending_files);
    setSelectedDirectory(status.target_directory);
    setNeedsReindex(status.needs_rebuild);
    setShowBanner(status.pending_files_count > 0 || status.needs_rebuild);
  };

  const refreshStatus = async () => {
    try {
      const status = await fetchStatus();
      applyStatus(status);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  useEffect(() => {
    const onConfigUpdated = () => {
      refreshStatus();
    };
    window.addEventListener("config-updated", onConfigUpdated);
    return () => window.removeEventListener("config-updated", onConfigUpdated);
  }, []);

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => {
        setShowSyncModal(false);
        refreshStatus();
      }, 1000);
    }
  }, [isComplete]);

  if (isLoadingPending) {
    return <LoadingScreen message="Scanning Pending Files" />;
  }

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setIsSearching(true);
      const response = await searchDocument({ query });
      setResults((response as SearchResponse).results ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSync = async () => {
    setShowSyncModal(true);

    if (needsReindex) {
      await resetIndex();
      const status = await fetchStatus(); // guaranteed response or throws
      applyStatus(status);

      startSync(status.pending_files);
    } else {
      startSync(pendingFiles);
    }
  };
  const displayResults = results;

  return (
    <div className="dashboard-container">
      {showBanner && (pendingFiles.length > 0 || needsReindex) && (
        <div className="alert-banner">
          <div className="banner-left">
            <span className="banner-icon">{needsReindex ? "⚠️" : "📄"}</span>

            {needsReindex ? (
              <span>
                <strong style={{ color: "#fbbf24" }}>Reindex required</strong>{" "}
                because your indexing settings have changed. Your search results
                may be outdated until you rebuild the index.
              </span>
            ) : (
              <span>
                <strong style={{ color: "#fbbf24" }}>
                  {pendingFiles.length} new file
                  {pendingFiles.length !== 1 ? "s" : ""}
                </strong>{" "}
                detected in {selectedDirectory}
              </span>
            )}
          </div>

          <div className="banner-right">
            <button className="btn-sync" onClick={handleSync}>
              {needsReindex ? "Reindex Now" : "Sync Now"}
            </button>

            <button className="btn-ignore" onClick={() => setShowBanner(false)}>
              Ignore
            </button>

            <button className="btn-close" onClick={() => setShowBanner(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        totalFiles={totalFiles}
        indexedFiles={indexedFiles}
        currentFileName={currentFileName}
      />

      <div className="search-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={
              isAgentActive
                ? "Ask me anything about your documents..."
                : "Search by meaning or concept..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <div className="agent-toggle-row">
          <div className="toggle-group">
            <label className="switch">
              <input
                type="checkbox"
                checked={isAgentActive}
                onChange={(e) => setIsAgentActive(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <span className="toggle-label">
              ✨ AI Agent Mode
              {isAgentActive && <span className="badge-active">Active</span>}
            </span>
          </div>
          <button
            type="button"
            className="settings-btn-subtle"
            onClick={() => navigate("/settings")}
            title="Settings"
            aria-label="Settings"
          >
            <Settings2 size={18} />
          </button>
        </div>
        <span className="toggle-subtext">
          {isAgentActive
            ? "AI reads documents to chat and synthesize answers with citations"
            : "Fast semantic search - instantly fetches matching files"}
        </span>
      </div>

      {isAgentActive ? (
        <div className="bottom-split-layout">
          <div className="search-results-area-populated">
            <div className="results-header">
              <span>
                {displayResults.length} results for "{query && "..."}"
              </span>
              <span>Click + to pin files to agent context</span>
            </div>
            <div className="results-list">
              {displayResults.map((result) => (
                <SearchResultCard
                  key={result.file_path}
                  result={result}
                  showPin
                  onPin={() =>
                    alert(`Pinned ${result.filename} to AI context!`)
                  }
                  onOpen={async () => {
                    try {
                      await openPath(result.file_path);
                    } catch (err) {
                      console.error("openPath failed:", err);
                      try {
                        await navigator.clipboard.writeText(result.file_path);
                        alert(
                          `Could not open file directly. Path copied to clipboard:\n${result.file_path}`,
                        );
                      } catch (copyErr) {
                        alert(`Could not open file. Path: ${result.file_path}`);
                      }
                    }
                  }}
                />
              ))}
            </div>
          </div>
          <div className="ai-chat-sidebar">
            <div className="chat-header">
              <div className="chat-title-group">
                <Sparkles className="agent-icon" size={18} />
                <div>
                  <div className="agent-title">AI Agent</div>
                  <div className="agent-subtitle">Local • Ollama</div>
                </div>
              </div>
              <button
                className="btn-close-chat"
                onClick={() => setIsAgentActive(false)}
              >
                ✕
              </button>
            </div>
            <div className="pinned-files">
              No files pinned — use + on search results to add context
            </div>
            <div className="chat-history">
              <div className="chat-bubble">
                Hello! I'm your local AI agent. Pin files from your search
                results using the <strong>+</strong> button, then ask me
                anything about them. I can also search your file index for you.
              </div>
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask about your files or type 'search ...'"
              />
              <button className="btn-send">➤</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="search-results-container">
          <div className="results-header">
            <span>
              {displayResults.length} results for "{query || "..."}"
            </span>
            <span>Use ↑↓ to navigate · Enter to open</span>
          </div>
          <div className="results-list">
            {displayResults.length > 0 ? (
              displayResults.map((result) => (
                <SearchResultCard key={result.file_path} result={result} />
              ))
            ) : (
              <div className="empty-results">
                No results yet. Enter a query to search your indexed documents.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
