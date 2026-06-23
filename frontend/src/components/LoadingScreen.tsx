type LoadingScreenProps = {
  message: string;
};
export default function LoadingScreen({ message }: LoadingScreenProps) {
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
        <p>{message}</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}
