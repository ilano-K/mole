import { useEffect, useState } from "react";
import "./Dashboard.css";
import { scanPendingFiles, searchDocument } from "../../api/document";
import LoadingScreen from "../../components/LoadingScreen";
import SyncProgress from "../sync/SyncProgress";
import { fetchAppConfig } from "../../api/config";
import { useSync } from "../../hooks/useSync";
import { SearchResponse, SearchResult } from "../../types/document";
import SearchResultCard from "./SearchResultCard";
import { openPath } from "@tauri-apps/plugin-opener";

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

  const fetchPendingFiles = async () => {
    try {
      const resultScan = await scanPendingFiles();
      setPendingFiles(resultScan?.files ?? []);

      const resultConfig = await fetchAppConfig();
      setSelectedDirectory(resultConfig?.target_directory ?? "");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  const { totalFiles, indexedFiles, currentFileName, isComplete, startSync } =
    useSync();

  useEffect(() => {
    fetchPendingFiles();
  }, []);

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => {
        setShowSyncModal(false);
        fetchPendingFiles();
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
  return (
    <div className="dashboard-container">
      {/* 1. THE NOTIFICATION BANNER */}
      {showBanner && pendingFiles.length > 0 && (
        <div className="alert-banner">
          <div className="banner-left">
            <span className="banner-icon">📄</span>
            <span>
              <strong style={{ color: "#fbbf24" }}>
                {pendingFiles.length} new files
              </strong>{" "}
              detected in {selectedDirectory}
            </span>
          </div>
          <div className="banner-right">
            <button
              className="btn-sync"
              onClick={() => {
                setShowSyncModal(true);
                startSync(pendingFiles);
              }}
            >
              Sync Now
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

      {/* Sync modal popup */}
      {showSyncModal && (
        <div
          className="sync-modal-overlay"
          onClick={() => setShowSyncModal(false)}
        >
          <div className="sync-modal" onClick={(e) => e.stopPropagation()}>
            <SyncProgress
              totalFiles={totalFiles}
              indexedFiles={indexedFiles}
              currentFileName={currentFileName}
            />
          </div>
        </div>
      )}

      {/* 2. THE MAIN SEARCH CARD */}
      <div className="search-card">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
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
              ✨ AI Agent Mode{" "}
              {isAgentActive && <span className="badge-active">Active</span>}
            </span>
          </div>
          {/* Dynamically swap the subtext based on the toggle state */}
          <span className="toggle-subtext">
            {isAgentActive
              ? "AI reads documents to chat and synthesize answers with citations"
              : "Fast semantic search - instantly fetches matching files"}
          </span>
        </div>
      </div>

      {/* 3. THE DYNAMIC BOTTOM LAYOUT */}
      {isAgentActive ? (
        // --- AGENT IS ON: Show the Split Layout ---
        <div className="bottom-split-layout">
          {/* Left Side: Populated Search Results Area */}
          <div className="search-results-area-populated">
            <div className="results-header">
              <span>5 results for "asdasda"</span>
              <span>Click + to pin files to agent context</span>
            </div>

            <div className="results-list">
              {results.map((result) => (
                <SearchResultCard
                  key={result.file_path}
                  result={result}
                  showPin
                  onPin={() =>
                    alert(`Pinned ${result.filename} to AI context!`)
                  }
                  onOpen={async () => {
                    try {
                      console.log(result.file_path);
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

          {/* Right Side: AI Chat Sidebar */}
          <div className="ai-chat-sidebar">
            <div className="chat-header">
              <div className="chat-title-group">
                <span className="agent-icon">🤖</span>
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
        // --- AGENT IS OFF: Show the Standard Semantic Search Area ---
        <div className="search-results-container">
          <div className="results-header">
            <span>5 results for "asdasda"</span>
            <span>Use ↑↓ to navigate · Enter to open</span>
          </div>

          <div className="results-list">
            {results.length > 0 ? (
              results.map((result, index) => (
                <SearchResultCard
                  key={result.file_path}
                  result={result}
                  isActive={index === 0}
                  showChevron={index === 0}
                />
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
