import { Navigate, Route, Routes } from "react-router-dom";

import LoadingScreen from "./components/LoadingScreen";
import { ToastProvider } from "./components/ToastProvider";
import Dashboard from "./features/dashboard/Dashboard";
import Settings from "./features/settings/Settings";
import Setup from "./features/setup/Setup";
import SyncProgress from "./features/sync/SyncProgress";
import { useStartup } from "./hooks/useStartup";

export default function App() {
  const { isConfigured, isLoading } = useStartup();

  if (isLoading) {
    return <LoadingScreen message="Waking up mole." />;
  }

  return (
    <ToastProvider>
      <main
        style={{
          width: "100%",
          height: "100vh",
          margin: 0,
          padding: 0,
          display: "flex",
        }}
      >
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/sync" element={<SyncProgress />} />

          <Route
            path="*"
            element={
              <Navigate to={isConfigured ? "/dashboard" : "/setup"} replace />
            }
          />
        </Routes>
      </main>
    </ToastProvider>
  );
}
