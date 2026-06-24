import { Route, Navigate, Routes } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import Dashboard from "./features/dashboard/Dashboard";
import SelectDirectory from "./features/setup/SelectDirectory";
import { useStartup } from "./hooks/useStartup";
import SyncProgress from "./features/sync/SyncProgress";

export default function App() {
  const { isConfigured, isLoading } = useStartup();

  if (isLoading) {
    return <LoadingScreen message="Waking up Mole..." />;
  }

  // 3. The Route Decision (Once loading is complete)
  return (
    <main
      style={{
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Routes>
        <Route path="/setup" element={<SelectDirectory />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sync" element={<SyncProgress />} />
        <Route
          path="*"
          element={
            <Navigate to={isConfigured ? "/dashboard" : "/setup"} replace />
          }
        />
      </Routes>
    </main>
  );
}
