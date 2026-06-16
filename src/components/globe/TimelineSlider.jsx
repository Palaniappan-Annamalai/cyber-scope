import { useRef, useState, useEffect, useCallback } from "react";
import { useGlobe } from "../../context/GlobeContext";

const MIN = 2001;
const MAX = 2025;
const EVENT_YEARS = [2001,2003,2007,2009,2011,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];

export default function TimelineSlider({ globeRef }) {
  const {
    yearRange, setYearRange,
    setSelectedYear, setSliderDragging,
    openRightPanel, rightPanel,
  } = useGlobe();

  const [yearS, yearE] = yearRange;
  const trackRef   = useRef(null);
  const dragging   = useRef(null);   // "start" | "end" | null
  const hasStarted = useRef(false);  // true once user has dragged for the first time
  const rafRef     = useRef(null);
  const pendingYS  = useRef(yearS);
  const pendingYE  = useRef(yearE);

  const pct       = y  => ((y - MIN) / (MAX - MIN)) * 100;
  const fromPct   = p  => Math.round(MIN + (MAX - MIN) * Math.max(0, Math.min(1, p)));
  const clientToYear = useCallback(clientX => {
    if (!trackRef.current) return MIN;
    const r = trackRef.current.getBoundingClientRect();
    return fromPct((clientX - r.left) / r.width);
  }, []);

  // Flush pending updates via rAF for smoothness
  const flush = useCallback(() => {
    setYearRange([pendingYS.current, pendingYE.current]);
    setSelectedYear(pendingYE.current);
    globeRef?.current?.setFilters?.();
    rafRef.current = null;
  }, [setYearRange, setSelectedYear, globeRef]);

  const scheduleFlush = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(flush);
  }, [flush]);

  const onPointerDown = useCallback((handle, e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = handle;
    setSliderDragging(true);

    // First drag: reset end handle to start position so timeline builds from scratch
    if (!hasStarted.current) {
      hasStarted.current = true;
      // Collapse end to start so user watches events appear one by one
      const startYear = pendingYS.current;
      pendingYE.current = startYear;
      setYearRange([startYear, startYear]);
      setSelectedYear(startYear);
    }

    // Auto-enable orgs on globe + open timeline panel
    globeRef?.current?.setShowOrgs?.(true);
    openRightPanel("timeline", { group: "timeline", key: null });

    const onMove = ev => {
      const y = clientToYear(ev.clientX);
      if (dragging.current === "start") {
        pendingYS.current = Math.min(y, pendingYE.current);
      } else {
        pendingYE.current = Math.max(y, pendingYS.current);
      }
      scheduleFlush();
    };

    const onUp = () => {
      dragging.current = null;
      setSliderDragging(false);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup",   onUp);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerup",   onUp);
  }, [clientToYear, scheduleFlush, setSliderDragging, openRightPanel, globeRef, setYearRange, setSelectedYear]);

  // Keep pending refs in sync with external changes
  useEffect(() => { pendingYS.current = yearS; }, [yearS]);
  useEffect(() => { pendingYE.current = yearE; }, [yearE]);

  const sLeft = pct(yearS);
  const eLeft = pct(yearE);

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 52,
      background: "rgba(11,14,24,0.96)",
      borderTop: "1px solid #1e2538",
      display: "flex", alignItems: "center",
      padding: "0 18px", gap: 12, zIndex: 50,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#3d556e", letterSpacing: "1.5px", whiteSpace: "nowrap" }}>
        TIMELINE
      </span>

      {/* Year label left */}
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#ec4899", minWidth: 34 }}>
        {yearS}
      </span>

      {/* Track */}
      <div ref={trackRef} style={{ flex: 1, position: "relative", height: 6, cursor: "pointer" }}>
        {/* Background */}
        <div style={{ position: "absolute", inset: 0, background: "#1a2640", borderRadius: 4 }} />

        {/* Active fill */}
        <div style={{
          position: "absolute", top: 0, height: "100%", borderRadius: 4,
          background: "linear-gradient(90deg,#ec4899,#a855f7)",
          left: sLeft + "%", width: (eLeft - sLeft) + "%",
          transition: "width .05s, left .05s",
        }} />

        {/* Year tick marks */}
        {EVENT_YEARS.map(y => (
          <div key={y} style={{
            position: "absolute", top: -12, left: pct(y) + "%",
            transform: "translateX(-50%)", display: "flex",
            flexDirection: "column", alignItems: "center", gap: 1, pointerEvents: "none",
          }}>
            <span style={{
              fontSize: 7, fontFamily: "monospace",
              color: y >= yearS && y <= yearE ? "#7a96b5" : "#2a3a52",
              transition: "color .2s",
            }}>{y}</span>
            <div style={{
              width: y % 5 === 1 ? 1.5 : 1, height: y % 5 === 1 ? 8 : 5,
              background: y >= yearS && y <= yearE ? "#3a5080" : "#1e2d45",
              borderRadius: 1,
            }} />
          </div>
        ))}

        {/* Start handle */}
        <Handle left={sLeft} color="#ec4899" label={yearS} onPointerDown={e => onPointerDown("start", e)} />
        {/* End handle */}
        <Handle left={eLeft} color="#a855f7" label={yearE} onPointerDown={e => onPointerDown("end", e)} />
      </div>

      {/* Year label right */}
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#a855f7", minWidth: 34 }}>
        {yearE}
      </span>
    </div>
  );
}

function Handle({ left, color, label, onPointerDown }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onPointerDown={onPointerDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute", top: "50%", left: left + "%",
        transform: "translate(-50%,-50%)",
        width: 18, height: 18, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}99)`,
        border: "2.5px solid #0d0f17",
        cursor: "ew-resize", zIndex: 10,
        boxShadow: hovered
          ? `0 0 0 5px ${color}35, 0 0 16px ${color}66`
          : `0 0 0 0px ${color}00, 0 0 6px ${color}44`,
        transition: "box-shadow .15s",
        touchAction: "none",
      }}
    >
      {/* Floating year tooltip on hover */}
      {hovered && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)",
          background: color, color: "#fff",
          fontSize: 9, fontWeight: 800, fontFamily: "monospace",
          padding: "2px 6px", borderRadius: 4,
          whiteSpace: "nowrap", pointerEvents: "none",
          boxShadow: `0 0 8px ${color}88`,
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
