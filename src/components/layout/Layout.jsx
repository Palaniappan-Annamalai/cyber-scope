import { Link, useLocation } from "react-router-dom";
import { GlobeProvider } from "../../context/GlobeContext";

export default function Layout({ children }) {
  const loc = useLocation();
  const isGlobe = loc.pathname === "/" || loc.pathname === "/globe";

  return (
    <GlobeProvider>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'Inter', -apple-system, sans-serif", background: "hsl(225,25%,6%)" }}>

        {/* ── TOPBAR ── */}
        <header style={{
          flexShrink: 0, height: 52, display: "flex", alignItems: "center",
          background: "rgba(13,15,23,0.97)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid hsl(225,20%,16%)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04)", zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderRight: "1px solid hsl(225,20%,16%)", height: "100%", flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#ec4899,#a855f7)", flexShrink: 0 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" width="15" height="15">
                <circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2a10 10 0 010 12M8 2a10 10 0 000 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-.2px", background: "linear-gradient(90deg,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                CyberScope
              </div>
              <div style={{ fontSize: 8, color: "#3d556e", letterSpacing: "2px", marginTop: 1 }}>THREAT INTELLIGENCE</div>
            </div>
          </div>

          {/* MAP tab */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{
              position: "relative", display: "flex", alignItems: "center", height: 52,
              padding: "0 18px", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
              borderRight: "1px solid hsl(225,20%,16%)",
              color: isGlobe ? "#ec4899" : "#7a96b5",
              letterSpacing: ".5px",
            }}>
              MAP
              {isGlobe && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ec4899,#a855f7)", borderRadius: "2px 2px 0 0" }} />}
            </div>
          </Link>

          <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.2)} }`}</style>
        </header>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, height: "calc(100vh - 52px)", overflow: "hidden", position: "relative" }}>
          {children}
        </main>
      </div>
    </GlobeProvider>
  );
}
