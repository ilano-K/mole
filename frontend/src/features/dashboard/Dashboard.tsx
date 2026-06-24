import { useEffect, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { scanPendingFiles } from "../../api/document";
import LoadingScreen from "../../components/LoadingScreen";
import SyncProgress from "../sync/SyncProgress";
import { fetchAppConfig } from "../../api/config";

// Temporary mock data for testing the UI
const mockSearchResults = [
  {
    id: 1,
    type: "pdf",
    icon: "📄",
    name: "Data_Privacy_Act_2024.pdf",
    badge: "PDF",
    excerpt:
      "The Data Privacy Act establishes comprehensive rules for data protection and user consent...",
    path: "C:/Users/YourName/Documents/Research/Legal",
  },
  {
    id: 2,
    type: "docx",
    icon: "📝",
    name: "Filipino_Heritage_Notes.docx",
    badge: "DOCX",
    excerpt:
      "My research on Filipino heritage reveals deep cultural traditions spanning centuries...",
    path: "C:/Users/YourName/Documents/Research/Culture",
  },
  {
    id: 3,
    type: "txt",
    icon: "📃",
    name: "Privacy_Regulations_Summary.txt",
    badge: "TXT",
    excerpt:
      "Key privacy regulations include GDPR, CCPA, and local data protection acts...",
    path: "C:/Users/YourName/Documents/Research/Legal",
  },
];

export default function Dashboard() {
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [pendingFiles, setPendingFiles] = useState(0);
  const [selectedDirectory, setSelectedDirectory] = useState("");
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const loadPendingFiles = async () => {
    try {
      const resultScan = await scanPendingFiles();
      setPendingFiles(resultScan?.pending_count ?? 0);

      const resultConfig = await fetchAppConfig();
      setSelectedDirectory(resultConfig?.target_directory ?? "");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  useEffect(() => {
    loadPendingFiles();
  }, []);
  if (isLoadingPending) {
    return <LoadingScreen message="Scanning Pending Files" />;
  }
  return (
    <div className="dashboard-container">
      {/* 1. THE NOTIFICATION BANNER */}
      {showBanner && pendingFiles > 0 && (
        <div className="alert-banner">
          <div className="banner-left">
            <span className="banner-icon">📄</span>
            <span>
              <strong style={{ color: "#fbbf24" }}>
                {pendingFiles} new files
              </strong>{" "}
              detected in {selectedDirectory}
            </span>
          </div>
          <div className="banner-right">
            <button className="btn-sync" onClick={() => setShowSyncModal(true)}>
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
            <SyncProgress />
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
              {mockSearchResults.map((result) => (
                <div key={result.id} className="result-card">
                  {/* Dynamic Icon Color based on file type */}
                  <div className={`result-icon icon-${result.type}`}>
                    {result.icon}
                  </div>

                  <div className="result-content">
                    <div className="result-title-row">
                      <span className="result-title">{result.name}</span>
                      <span className="result-badge">{result.badge}</span>
                    </div>
                    <div className="result-excerpt">{result.excerpt}</div>
                    <div className="result-path">{result.path}</div>
                  </div>

                  {/* THE PIN BUTTON FOR AGENT MODE */}
                  <button
                    className="btn-pin"
                    title="Pin to AI Context"
                    onClick={() =>
                      alert(`Pinned ${result.name} to AI context!`)
                    }
                  >
                    +
                  </button>
                </div>
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
            {mockSearchResults.map((result, index) => (
              <div
                key={result.id}
                // We make the first item "active" to match your screenshot
                className={`result-card ${index === 0 ? "active" : ""}`}
              >
                {/* Dynamic Icon Color based on file type */}
                <div className={`result-icon icon-${result.type}`}>
                  {result.icon}
                </div>

                <div className="result-content">
                  <div className="result-title-row">
                    <span className="result-title">{result.name}</span>
                    <span className="result-badge">{result.badge}</span>
                  </div>
                  <div className="result-excerpt">{result.excerpt}</div>
                  <div className="result-path">{result.path}</div>
                </div>

                {/* Only show the blue chevron on the active item */}
                {index === 0 && <div className="result-arrow">❯</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
