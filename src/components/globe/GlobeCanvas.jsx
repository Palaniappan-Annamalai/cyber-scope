import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initGlobe } from "../../lib/globeEngine";
import { useGlobe } from "../../context/GlobeContext";
import { SECTOR_COLORS, SEVERITY_COLORS, ATTACK_COLORS } from "../../lib/colors";

function loadScript(src) {
  return new Promise((res, rej) => {
    if (src.includes("d3") && window.d3) { res(); return; }
    if (src.includes("topojson") && window.topojson) { res(); return; }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { existing.addEventListener("load", res); existing.addEventListener("error", rej); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

function OrgTooltip({ org, x, y }) {
  if (!org) return null;
  const sc = SECTOR_COLORS[org.sector] || "#60a5fa";
  const sv = SEVERITY_COLORS[org.sev] || "#ef4444";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.12 }}
      style={{
        position: "fixed", left: x + 14, top: y - 10, zIndex: 999,
        pointerEvents: "none", background: "rgba(11,14,24,0.98)",
        border: "1px solid rgba(30,37,56,0.9)", borderRadius: 12,
        padding: "10px 14px", minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: sc, marginBottom: 4 }}>{org.name}</div>
      <div style={{ fontSize: 10, color: "#7a96b5", marginBottom: 3 }}>
        {org.sector} · {org.iso}{org.st ? " · " + org.st : ""}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: sv }} />
        <span style={{ fontSize: 10, color: sv, fontWeight: 600 }}>{org.sev}</span>
      </div>
      {org.loss > 0 && (
        <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>${org.loss.toLocaleString()}M loss</div>
      )}
      <div style={{ marginTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 5, display: "flex", flexDirection: "column", gap: 4 }}>
        {org.ev.map((e, i) => {
          const evCol = ATTACK_COLORS[e.t] || "#7a96b5";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: evCol, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: evCol }}>{e.t}</span>
              <span style={{ fontSize: 10, color: "#3d556e", marginLeft: "auto", fontFamily: "monospace" }}>{e.y}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 9, color: "#3d556e", marginTop: 4 }}>
        click to select
      </div>
    </motion.div>
  );
}

const GlobeCanvas = forwardRef(function GlobeCanvas(props, ref) {
  const containerRef = useRef(null);
  const rightPanelRef = useRef(false);
  const engineRef = useRef(null);
  const initDone = useRef(false);

  // ── LIVE FILTER REF — always holds the current values, never stale ──────────
  const filtersRef = useRef({
    activeSectors: new Set(), activeAttacks: new Set(),
    activeRegions: new Set(), activeSeverity: new Set(),
    yearS: 2001, yearE: 2025,
  });

  const [ready, setReady] = useState(false);
  const [hoveredOrg, setHoveredOrg] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [showOrgs, setShowOrgs] = useState(false);
  const [autoRot, setAutoRot] = useState(true);

  const {
    activeSectors, activeAttacks, activeRegions, activeSeverity,
    yearRange, setSelectedCountry, setSelectedState, setSelectedOrg,
    setHoveredOrg: setCtxHoveredOrg,
    rightPanel,
  } = useGlobe();
  const [yearS, yearE] = yearRange;

  // Keep filtersRef always current — this is what the engine reads via getFilters()
  useEffect(() => {
    filtersRef.current = { activeSectors, activeAttacks, activeRegions, activeSeverity, yearS, yearE };
    engineRef.current?.setFilters?.();
  }, [activeSectors, activeAttacks, activeRegions, activeSeverity, yearS, yearE]);

  // Expose engine methods via ref
  useImperativeHandle(ref, () => ({
    setFilters: () => engineRef.current?.setFilters(),
    zoomToCountry: (iso) => engineRef.current?.zoomToCountry(iso),
    zoom: (f) => engineRef.current?.zoom(f),
    resetView: () => engineRef.current?.resetView(),
    setShowOrgs: (v) => { setShowOrgs(v); engineRef.current?.setShowOrgs(v); },
    setAutoRot: (v) => { setAutoRot(v); engineRef.current?.setAutoRot(v); },
    getShowOrgs: () => showOrgs,
    getAutoRot: () => autoRot,
  }));

  // Load scripts
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js");
        if (!cancelled) setReady(true);
      } catch(e) { console.error("Globe script load failed", e); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Init globe — getFilters always reads from the live ref, never from stale closure
  useEffect(() => {
    if (!ready || initDone.current || !containerRef.current) return;
    const raf = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        if (!containerRef.current || !window.d3) return;
        initDone.current = true;
        engineRef.current = initGlobe(containerRef.current, {
          onOrgHover: (org, x, y) => {
            setHoveredOrg(org);
            setHoverPos({ x, y });
            setCtxHoveredOrg(org);
          },
          onOrgSelect: (org) => { setSelectedOrg(org); },
          onCountrySelect: (iso) => { setSelectedCountry(iso); },
          onStateSelect: (abbr, name) => { setSelectedState({ abbr, name }); },
          // Always reads live values — no stale closure
          getFilters: () => filtersRef.current,
          getYearRange: () => filtersRef.current,
          getRightPanelOpen: () => rightPanelRef.current,
        });
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  // When right panel opens/closes, recentre globe
  useEffect(() => {
    rightPanelRef.current = rightPanel !== null;
    engineRef.current?.setFilters?.();
    engineRef.current?.recenter?.();
  }, [rightPanel]);

  // Cleanup
  useEffect(() => {
    return () => {
      engineRef.current?.destroy?.();
      initDone.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", background: "#0d0f17", overflow: "hidden" }}
    >
      <canvas
        id="globe-canvas"
        style={{ display: "block", position: "absolute", inset: 0, cursor: "grab" }}
      />

      {!ready && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, zIndex: 100 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(236,72,153,0.15)", borderTop: "3px solid #ec4899", animation: "globe-spin .8s linear infinite" }} />
          <div style={{ fontSize: 11, color: "#3d556e", letterSpacing: 1 }}>Loading globe...</div>
          <style>{`@keyframes globe-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Controls bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 36, display: "flex", alignItems: "center", padding: "0 14px", gap: 8, zIndex: 40, background: "rgba(13,15,23,0.75)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(30,37,56,0.5)" }}>
        <span style={{ fontSize: 9.5, color: "#3d556e" }}>🌍 Click country · Click org · Drag to rotate</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button
            onClick={() => ref?.current?.setShowOrgs?.(!showOrgs)}
            style={{ padding: "2px 9px", fontSize: 9.5, fontWeight: 500, color: showOrgs ? "#ec4899" : "#7a96b5", border: `1px solid ${showOrgs ? "rgba(236,72,153,.5)" : "#263048"}`, borderRadius: 6, background: showOrgs ? "rgba(236,72,153,.1)" : "rgba(255,255,255,.04)", cursor: "pointer" }}
          >
            {showOrgs ? "Hide Orgs" : "Show Orgs"}
          </button>
          <button
            onClick={() => ref?.current?.setAutoRot?.(!autoRot)}
            style={{ padding: "2px 9px", fontSize: 9.5, fontWeight: 500, color: autoRot ? "#ec4899" : "#7a96b5", border: `1px solid ${autoRot ? "rgba(236,72,153,.5)" : "#263048"}`, borderRadius: 6, background: autoRot ? "rgba(236,72,153,.1)" : "rgba(255,255,255,.04)", cursor: "pointer" }}
          >
            {autoRot ? "Auto-Rotate ON" : "Auto-Rotate OFF"}
          </button>
        </div>
      </div>

      {/* Zoom buttons */}
      <div style={{ position: "absolute", right: 12, bottom: 70, display: "flex", flexDirection: "column", gap: 3, zIndex: 45 }}>
        {[{l:"+",f:()=>ref?.current?.zoom?.(1.15)},{l:"−",f:()=>ref?.current?.zoom?.(.87)},{l:"⊙",f:()=>ref?.current?.resetView?.()}].map((b,i) => (
          <div key={i} onClick={b.f} style={{ width: 28, height: 28, background: "rgba(11,14,24,0.9)", border: "1px solid #263048", borderRadius: 7, color: "#7a96b5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, userSelect: "none" }}>{b.l}</div>
        ))}
      </div>

      <AnimatePresence>
        {hoveredOrg && <OrgTooltip org={hoveredOrg} x={hoverPos.x} y={hoverPos.y} />}
      </AnimatePresence>
    </div>
  );
});

export default GlobeCanvas;
