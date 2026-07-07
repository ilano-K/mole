import { ReactNode } from "react";

type Tab =
  | "Search"
  | "Embeddings"
  | "AI Agent"
  | "Library"
  | "Sync"
  | "Privacy";

interface Props {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  tabs: { name: Tab; icon: ReactNode }[];
}

export default function SettingsSidebar({
  activeTab,
  setActiveTab,
  tabs,
}: Props) {
  return (
    <div className="settings-sidebar">
      <div className="sidebar-header">SETTINGS</div>
      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`nav-item ${activeTab === tab.name ? "active" : ""}`}
            onClick={() => setActiveTab(tab.name)}
          >
            <span className="nav-icon">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
