import Dashboard from "./features/dashboard/Dashboard";
import SelectDirectory from "./features/setup/SelectDirectory";
import { useStartup } from "./hooks/useStartup";

export default function App() {
  const { isConfigured, isLoading } = useStartup();

  if (isLoading) {
    return (
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
          color: "var(--text-muted, #949cae)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255,255,255,0.05)",
              borderTop: "3px solid #2558b8",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p>Waking up Mole...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    );
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
      {isConfigured ? <Dashboard /> : <SelectDirectory />}
    </main>
  );
}
