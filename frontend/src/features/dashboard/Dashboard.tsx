import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, RefreshCw, Search, Settings2, Sparkles } from "lucide-react";
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

// Dashboard is the main landing page for document sync, search, and agent modes.
// It displays pending-file alerts, sync progress, and a hybrid search/chat interface.
export default function Dashboard() {
  // UI mode flags and sync state
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState("");
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showPreSyncModal, setShowPreSyncModal] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, setIsSearching] = useState(false);

  // Indicates that index metadata has changed and a full rebuild is required.
  const [needsReindex, setNeedsReindex] = useState(false);

  const navigate = useNavigate();
  const { totalFiles, indexedFiles, currentFileName, isComplete, startSync } =
    useSync();

  // Update all local status state from the backend status response.
  const applyStatus = (status: FetchStatusResponse) => {
    setPendingFiles(status.pending_files);
    setSelectedDirectory(status.target_directory);
    setNeedsReindex(status.needs_rebuild);
    setShowBanner(status.pending_files_count > 0 || status.needs_rebuild);
  };

  // Fetch the current sync/index status from the server and apply it locally.
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

  // Initial status load when the component mounts.
  useEffect(() => {
    refreshStatus();
  }, []);

  // Re-fetch status when external config changes occur.
  useEffect(() => {
    const onConfigUpdated = () => {
      refreshStatus();
    };
    window.addEventListener("config-updated", onConfigUpdated);
    return () => window.removeEventListener("config-updated", onConfigUpdated);
  }, []);

  // Close the sync modal and refresh status once the background sync completes.
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

  // Run a semantic search query against the document index.
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

  // Start the sync flow. This may show a pre-sync modal and then open the
  // full sync progress modal if there is work to do.
  const handleSync = async () => {
    refreshStatus();
    setShowPreSyncModal(true);

    const hasPendingFiles = pendingFiles.length > 0 || needsReindex;

    if (hasPendingFiles) {
      setTimeout(() => {
        setShowPreSyncModal(false);
        setShowSyncModal(true);
      }, 1200);
    }

    if (needsReindex) {
      await resetIndex();
      const status = await fetchStatus(); // guaranteed response or throws
      applyStatus(status);

      startSync(status.pending_files);
    } else {
      startSync(pendingFiles);
    }
  };

  // If no pending files exist, allow the user to rebuild the index manually.
  const handleRebuildFromModal = async () => {
    try {
      setShowPreSyncModal(false);
      setShowSyncModal(true);

      await resetIndex();
      const status = await fetchStatus(); // guaranteed response or throws
      applyStatus(status);

      startSync(status.pending_files);
    } catch (error) {
      console.error("Rebuild failed:", error);
      setShowSyncModal(false);
    }
  };
  const displayResults = results;

  // Render the dashboard shell, including alerts, sync modals, search input,
  // and either the AI agent workspace or the plain search results view.
  return (
    <div className="dashboard-container">
      {showBanner && (pendingFiles.length > 0 || needsReindex) && (
        // Alert banner that tells the user if syncing is needed or a reindex is required.
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

      {/* Pre-sync modal: informs the user about folder status and exposes a rebuild
          action when no new files are pending. */}
      {showPreSyncModal && (
        <div className="pre-sync-modal-overlay" role="dialog" aria-modal="true">
          <div className="pre-sync-modal">
            <button
              type="button"
              className="pre-sync-close"
              onClick={() => setShowPreSyncModal(false)}
              aria-label="Close pre-sync status"
            >
              ✕
            </button>
            {pendingFiles.length === 0 ? (
              <div className="pre-sync-check" aria-hidden="true">
                <Check size={24} />
              </div>
            ) : (
              <div className="pre-sync-spinner" />
            )}
            <h3>
              {pendingFiles.length === 0 ? "Up to date" : "Scanning folder…"}
            </h3>
            <p>
              {pendingFiles.length === 0
                ? "No new files need syncing right now."
                : `Preparing your sync for ${selectedDirectory || "your selected folder"}`}
            </p>
            <div className="pre-sync-summary">
              {pendingFiles.length === 0 ? (
                <span>Everything is up to date</span>
              ) : (
                <span>
                  Found {pendingFiles.length} file
                  {pendingFiles.length === 1 ? "" : "s"} ready to sync
                </span>
              )}
            </div>
            {pendingFiles.length === 0 && (
              <div className="pre-sync-actions">
                <button
                  type="button"
                  className="btn-rebuild"
                  onClick={handleRebuildFromModal}
                >
                  Rebuild Index
                </button>
              </div>
            )}
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

      {/* Search card: query input, AI mode toggle, and quick sync/settings actions. */}
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
          <div className="dashboard-actions">
            <button
              type="button"
              className="sync-action-btn"
              onClick={handleSync}
              title="Sync documents"
              aria-label="Sync documents"
            >
              <RefreshCw size={16} />
              <span>Sync</span>
            </button>
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
        </div>
        <span className="toggle-subtext">
          {isAgentActive
            ? "AI reads documents to chat and synthesize answers with citations"
            : "Fast semantic search - instantly fetches matching files"}
        </span>
      </div>

      {isAgentActive ? (
        // AI mode layout: search results on the left with a contextual chat sidebar.
        <div className="bottom-split-layout">
          <div className="search-results-area-populated">
            <div className="results-header">
              {query ? (
                <span>
                  {displayResults.length} results for "{query}"
                </span>
              ) : (
                <span>Try searching your documents</span>
              )}
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
            <div className="chat-input-area disabled">
              <input
                type="text"
                className="chat-input"
                placeholder="Coming soon!"
                disabled
              />
              <button className="btn-send" disabled>➤</button>
            </div>
          </div>
        </div>
      ) : (
        // Standard search layout: a simple list of result cards for quick lookup.
        <div className="search-results-container">
          <div className="results-header">
            {query ? (
              <span>
                {displayResults.length} results for "{query}"
              </span>
            ) : (
              <span>Try searching your documents</span>
            )}
            <span>Use ↑↓ to navigate · Enter to open</span>
          </div>
          <div className="results-list">
            {displayResults.length > 0 ? (
              displayResults.map((result) => (
                <SearchResultCard key={result.file_path} result={result} />
              ))
            ) : (
              <div className="empty-results">
                {query
                  ? "No results found. Try a different query."
                  : "Enter a query to search your indexed documents."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
