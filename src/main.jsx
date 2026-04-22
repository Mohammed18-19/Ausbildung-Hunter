import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD || "ausbildung2025";
const STORAGE_KEY      = "aih_authenticated";

function AuthGate() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === "1");
  const [input,  setInput]  = useState("");
  const [error,  setError]  = useState(false);
  const [shake,  setShake]  = useState(false);

  function handleLogin() {
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
    } else {
      setError(true); setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setError(false), 2500);
    }
  }

  if (authed) return <App onLogout={() => { sessionStorage.removeItem(STORAGE_KEY); setAuthed(false); }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#05050a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(#1a1a2e22 1px,transparent 1px),linear-gradient(90deg,#1a1a2e22 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="fade-up" style={{ background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 20, padding: "48px 40px", width: 380, position: "relative", zIndex: 1, animation: shake ? "shake .5s ease" : undefined }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: 14, width: 56, height: 56, fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: "#000", marginBottom: 16 }}>AIH</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 3, color: "#f8fafc" }}>INTELLIGENCE HUNTER</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 6, letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace" }}>GERMANY CAREER PLATFORM</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>ACCESS CODE</div>
          <input
            type="password" placeholder="Enter your password" value={input} autoFocus
            onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", background: error ? "#ef444410" : "#0a0a14", border: error ? "1px solid #ef4444" : "1px solid #1a1a2e", color: "#e2e8f0", padding: "12px 16px", borderRadius: 10, fontSize: 15, outline: "none", fontFamily: "'Outfit',sans-serif", letterSpacing: 4, transition: "all .2s" }}
          />
          {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 8, textAlign: "center" }}>✗ Incorrect password</div>}
        </div>
        <button onClick={handleLogin} style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800, color: "#000", letterSpacing: 1 }}>
          ENTER PLATFORM →
        </button>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#2a2a3e" }}>AINTORA SYSTEMS · Private Access</div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<StrictMode><AuthGate /></StrictMode>);
