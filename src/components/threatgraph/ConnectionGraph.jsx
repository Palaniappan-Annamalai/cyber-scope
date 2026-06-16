import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { enrichIncidentsForCountry, attackerGroups } from "../../lib/relationshipData";
import { attackColors } from "../../lib/cyberData";

const SECTOR_COLORS = {
  Technology: "#06b6d4", Healthcare: "#10b981", Finance: "#f59e0b",
  Government: "#8b5cf6", Energy: "#f97316", Retail: "#ec4899",
  Education: "#84cc16", Defence: "#ef4444", Telecom: "#0ea5e9",
  Media: "#d946ef", Transport: "#fb923c",
};

// Colours for all state/region codes across all countries
const REGION_COLORS = {
  // US states
  CA:"#ef4444",TX:"#f97316",NY:"#eab308",DC:"#a855f7",FL:"#06b6d4",
  MA:"#10b981",VA:"#ec4899",WA:"#8b5cf6",IL:"#f43f5e",OH:"#84cc16",
  GA:"#0ea5e9",CO:"#d946ef",MD:"#fb923c",NJ:"#14b8a6",IN:"#f59e0b",
  MN:"#6366f1",AZ:"#e11d48",NH:"#22d3ee",GU:"#a3e635",MO:"#c084fc",
  TN:"#34d399",NC:"#f472b6",NV:"#60a5fa",
  // GB regions
  ENG:"#3b82f6",SCO:"#06b6d4",WAL:"#10b981",NIR:"#a855f7",
  // CN provinces
  BJ:"#ef4444",SH:"#f97316",GD:"#eab308",ZJ:"#a855f7",JS:"#06b6d4",
  // RU regions
  MSK:"#ef4444",SPB:"#f97316",NSK:"#eab308",EKB:"#a855f7",
  // KP / IR
  PY:"#ef4444",KHZ:"#f97316",
};

// Human-readable region labels
const REGION_LABELS = {
  ENG:"England",SCO:"Scotland",WAL:"Wales",NIR:"N. Ireland",
  BJ:"Beijing",SH:"Shanghai",GD:"Guangdong",ZJ:"Zhejiang",JS:"Jiangsu",
  MSK:"Moscow",SPB:"St. Petersburg",NSK:"Novosibirsk",EKB:"Yekaterinburg",
  PY:"Pyongyang",KHZ:"Khuzestan",
};

function regionLabel(code) {
  return REGION_LABELS[code] || code;
}

// ── Year Range Filter component — reused across all ThreatGraph views ─────────
export function YearRangeFilter({ yearFrom, yearTo, setYearFrom, setYearTo, compact = false }) {
  const MIN = 2001, MAX = 2025;
  const trackRef = React.useRef(null);
  const dragging = React.useRef(null);

  const pct = y => ((y - MIN) / (MAX - MIN)) * 100;

  const onPointerDown = (handle, e) => {
    e.preventDefault();
    dragging.current = handle;
    const onMove = ev => {
      if (!trackRef.current) return;
      const r = trackRef.current.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      const y = Math.round(MIN + (MAX - MIN) * p);
      if (dragging.current === "from") setYearFrom(Math.min(y, yearTo));
      else setYearTo(Math.max(y, yearFrom));
    };
    const onUp = () => {
      dragging.current = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerup", onUp);
  };

  // Quick preset buttons
  const presets = [
    { label: "All",       from: 2001, to: 2025 },
    { label: "2015–2025", from: 2015, to: 2025 },
    { label: "2020–2025", from: 2020, to: 2025 },
    { label: "Last 3yr",  from: 2023, to: 2025 },
  ];

  return (
    <div style={{
      padding: compact ? "8px 12px" : "10px 14px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(255,255,255,0.02)",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#5a7592", textTransform: "uppercase", letterSpacing: "1px" }}>
          Year Range
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#ec4899" }}>{yearFrom}</span>
        <span style={{ fontSize: 10, color: "#3d556e" }}>—</span>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#a855f7" }}>{yearTo}</span>
        <span style={{ fontSize: 10, color: "#3d556e", marginLeft: 2 }}>
          · {yearTo - yearFrom + 1} yr{yearTo - yearFrom !== 0 ? "s" : ""}
        </span>
        {/* Presets */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {presets.map(p => {
            const active = yearFrom === p.from && yearTo === p.to;
            return (
              <button key={p.label}
                onClick={() => { setYearFrom(p.from); setYearTo(p.to); }}
                style={{
                  padding: "2px 8px", borderRadius: 6, fontSize: 9.5,
                  fontWeight: 500, cursor: "pointer", border: "1px solid",
                  borderColor: active ? "rgba(236,72,153,0.5)" : "rgba(255,255,255,0.1)",
                  background: active ? "rgba(236,72,153,0.1)" : "transparent",
                  color: active ? "#ec4899" : "rgba(255,255,255,0.4)",
                  transition: "all .15s",
                }}>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Track */}
      <div ref={trackRef} style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        {/* Background */}
        <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: "#1a2640", borderRadius: 4 }} />
        {/* Fill */}
        <div style={{
          position: "absolute",
          left: pct(yearFrom) + "%", width: (pct(yearTo) - pct(yearFrom)) + "%",
          height: 4, borderRadius: 4,
          background: "linear-gradient(90deg,#ec4899,#a855f7)",
          boxShadow: "0 0 6px rgba(236,72,153,0.35)",
        }} />
        {/* Year ticks */}
        {[2001,2005,2010,2015,2020,2025].map(y => (
          <div key={y} style={{
            position: "absolute", left: pct(y) + "%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            pointerEvents: "none",
          }}>
            <div style={{ width: 1, height: 6, background: "#263048", marginTop: 2 }} />
            <span style={{ fontSize: 7.5, fontFamily: "monospace", color: "#3d556e", marginTop: 1 }}>{y}</span>
          </div>
        ))}
        {/* From handle */}
        <YFHandle left={pct(yearFrom)} color="#ec4899" onPointerDown={e => onPointerDown("from", e)} />
        {/* To handle */}
        <YFHandle left={pct(yearTo)}   color="#a855f7" onPointerDown={e => onPointerDown("to",   e)} />
      </div>
    </div>
  );
}

function YFHandle({ left, color, onPointerDown }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onPointerDown={onPointerDown}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute", left: left + "%", top: "50%",
        transform: "translate(-50%,-50%)", zIndex: 10,
        cursor: "ew-resize", touchAction: "none",
        width: hov ? 22 : 16, height: hov ? 22 : 16, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${color}, ${color}bb)`,
        border: "2.5px solid #0d0f17",
        boxShadow: hov ? `0 0 0 4px ${color}33, 0 0 12px ${color}55` : `0 1px 4px rgba(0,0,0,0.5)`,
        transition: "all .15s",
      }}
    />
  );
}

// ── Build graph data from country-specific incidents ─────────────────────────
function buildGraphData(country, filterAttacker, filterAttackType, yearFrom, yearTo) {
  let incidents = enrichIncidentsForCountry(country).filter(i => i.attacker !== "unknown");
  if (filterAttacker)   incidents = incidents.filter(i => i.attacker === filterAttacker);
  if (filterAttackType) incidents = incidents.filter(i => i.attack   === filterAttackType);
  incidents = incidents.filter(i => i.year >= yearFrom && i.year <= yearTo);

  const attackerNodes  = {};
  const attackTypeNodes = {};
  const regionNodes    = {};
  const sectorNodes    = {};
  const edges = [];

  incidents.forEach(inc => {
    const ag = attackerGroups.find(g => g.id === inc.attacker);
    if (!ag) return;

    // Attacker node
    if (!attackerNodes[inc.attacker]) {
      attackerNodes[inc.attacker] = {
        id: `a_${inc.attacker}`, label: ag.label, color: ag.color,
        type: "attacker", origin: ag.origin, actorType: ag.type, count: 0,
      };
    }
    attackerNodes[inc.attacker].count++;

    // Attack type node
    const atkId = `t_${inc.attack}`;
    if (!attackTypeNodes[atkId]) {
      attackTypeNodes[atkId] = {
        id: atkId, label: inc.attack,
        color: attackColors[inc.attack] || "#6b7280", type: "attacktype", count: 0,
      };
    }
    attackTypeNodes[atkId].count++;

    // Region / state node — use the `state` field from the incident
    const regionCode = inc.state || "??";
    const regionId   = `r_${regionCode}`;
    if (!regionNodes[regionId]) {
      regionNodes[regionId] = {
        id: regionId,
        label: regionLabel(regionCode),
        color: REGION_COLORS[regionCode] || "#6b7280",
        type: "region", city: inc.city, count: 0,
      };
    }
    regionNodes[regionId].count++;

    // Sector node
    const secId = `s_${inc.sector}`;
    if (!sectorNodes[secId]) {
      sectorNodes[secId] = {
        id: secId, label: inc.sector,
        color: SECTOR_COLORS[inc.sector] || "#6b7280", type: "sector", count: 0,
      };
    }
    sectorNodes[secId].count++;

    // Edges: attacker → attack type → region → sector
    const e1 = `a_${inc.attacker}|${atkId}`;
    const e2 = `${atkId}|${regionId}`;
    const e3 = `${regionId}|${secId}`;

    const addEdge = (key, from, to, color) => {
      const ex = edges.find(e => e.key === key);
      if (!ex) edges.push({ key, from, to, color, weight: 1 });
      else ex.weight++;
    };
    addEdge(e1, `a_${inc.attacker}`, atkId,    ag.color);
    addEdge(e2, atkId,               regionId, attackColors[inc.attack] || "#6b7280");
    addEdge(e3, regionId,            secId,    SECTOR_COLORS[inc.sector] || "#6b7280");
  });

  return {
    nodes: [
      ...Object.values(attackerNodes),
      ...Object.values(attackTypeNodes),
      ...Object.values(regionNodes),
      ...Object.values(sectorNodes),
    ],
    edges,
    layers: {
      attacker:   Object.values(attackerNodes),
      attacktype: Object.values(attackTypeNodes),
      region:     Object.values(regionNodes),
      sector:     Object.values(sectorNodes),
    },
  };
}

// ── Layout: 4 columns ────────────────────────────────────────────────────────
function computeLayout(layers, W, H) {
  const positions = {};
  const cols  = ["attacker", "attacktype", "region", "sector"];
  const colX  = [W * 0.1, W * 0.35, W * 0.62, W * 0.88];
  const padding = 60;

  cols.forEach((col, ci) => {
    const items = layers[col] || [];
    items.forEach((node, i) => {
      const spacing = (H - padding * 2) / Math.max(items.length, 1);
      positions[node.id] = {
        x: colX[ci],
        y: padding + spacing * i + spacing / 2,
      };
    });
  });
  return positions;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ConnectionGraph({ country = "US" }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 900, h: 520 });
  const [selected, setSelected] = useState(null);
  const [filterAttacker, setFilterAttacker] = useState(null);
  const [filterAttackType, setFilterAttackType] = useState(null);
  const [yearFrom, setYearFrom] = useState(2001);
  const [yearTo,   setYearTo]   = useState(2025);
  const [zoom, setZoom] = useState(1);

  // Reset filters when country changes
  useEffect(() => {
    setSelected(null);
    setFilterAttacker(null);
    setFilterAttackType(null);
    setYearFrom(2001);
    setYearTo(2025);
    setZoom(1);
  }, [country]);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setDims({ w, h: Math.min(Math.max(w * 0.65, 400), 600) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { nodes, edges, layers } = useMemo(
    () => buildGraphData(country, filterAttacker, filterAttackType, yearFrom, yearTo),
    [country, filterAttacker, filterAttackType, yearFrom, yearTo]
  );

  const positions = useMemo(
    () => computeLayout(layers, dims.w / zoom, dims.h / zoom),
    [layers, dims.w, dims.h, zoom]
  );

  const highlightedIds = useMemo(() => {
    if (!selected) return null;
    const set = new Set([selected]);
    edges.forEach(e => {
      if (e.from === selected) set.add(e.to);
      if (e.to === selected)   set.add(e.from);
    });
    return set;
  }, [selected, edges]);

  const selectedNode   = selected ? nodes.find(n => n.id === selected) : null;
  const connectedEdges = selected ? edges.filter(e => e.from === selected || e.to === selected) : [];
  const connectedNodes = selected
    ? nodes.filter(n => n.id !== selected && connectedEdges.some(e => e.from === n.id || e.to === n.id))
    : [];

  const maxEdgeWeight = Math.max(...edges.map(e => e.weight), 1);

  // Only show attacker groups relevant to this country's incidents
  const presentAttackers = useMemo(() => {
    const ids = new Set(
      enrichIncidentsForCountry(country)
        .filter(i => i.attacker !== "unknown")
        .map(i => i.attacker)
    );
    return attackerGroups.filter(ag => ids.has(ag.id));
  }, [country]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-1">Attacker:</span>
          <button onClick={() => setFilterAttacker(null)}
            className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${!filterAttacker ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-border"}`}>
            All
          </button>
          {presentAttackers.map(ag => (
            <button key={ag.id} onClick={() => setFilterAttacker(filterAttacker === ag.id ? null : ag.id)}
              className="px-2.5 py-1 rounded-lg text-xs border transition-all"
              style={filterAttacker === ag.id
                ? { borderColor: ag.color, color: ag.color, backgroundColor: `${ag.color}12` }
                : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
              {ag.label.split(" /")[0].split(" (")[0]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setZoom(1); setSelected(null); setFilterAttacker(null); setFilterAttackType(null); setYearFrom(2001); setYearTo(2025); }}
            className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {selected && (
            <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/40 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Year range filter */}
      <YearRangeFilter yearFrom={yearFrom} yearTo={yearTo} setYearFrom={setYearFrom} setYearTo={setYearTo} />      {/* Column headers */}
      <div className="grid grid-cols-4 gap-2 px-2">
        {[
          { label: "Threat Actor",    color: "#ef4444", count: layers.attacker?.length },
          { label: "Attack Type",     color: "#a855f7", count: layers.attacktype?.length },
          { label: "State / Region",  color: "#06b6d4", count: layers.region?.length },
          { label: "Industry Target", color: "#f59e0b", count: layers.sector?.length },
        ].map(col => (
          <div key={col.label} className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: col.color }}>{col.label}</div>
            <div className="text-xs text-muted-foreground/40 font-mono">{col.count} nodes</div>
          </div>
        ))}
      </div>

      {/* SVG Graph */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden relative" ref={containerRef}>
        <svg
          width={dims.w} height={dims.h}
          style={{ display: "block", cursor: "default" }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <defs>
            <radialGradient id="cg-bg" cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.018)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          <rect width={dims.w} height={dims.h} fill="url(#cg-bg)" />

          {/* Column separator lines */}
          {[0.225, 0.485, 0.745].map((x, i) => (
            <line key={i}
              x1={dims.w * x} y1={20} x2={dims.w * x} y2={dims.h - 20}
              stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="4 6" />
          ))}

          {/* Edges */}
          {edges.map((edge, i) => {
            const from = positions[edge.from];
            const to   = positions[edge.to];
            if (!from || !to) return null;

            const isHighlighted = highlightedIds
              ? highlightedIds.has(edge.from) && highlightedIds.has(edge.to)
              : false;
            const opacity = highlightedIds ? (isHighlighted ? 0.75 : 0.04) : 0.2;
            const strokeW = Math.max(1, (edge.weight / maxEdgeWeight) * 4);
            const mx = (from.x + to.x) / 2;
            const d  = `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`;

            return (
              <motion.path key={edge.key} d={d} fill="none"
                stroke={edge.color}
                strokeWidth={isHighlighted ? strokeW + 1.5 : strokeW}
                strokeOpacity={opacity}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, strokeOpacity: opacity }}
                transition={{ duration: 1.2, delay: i * 0.008 }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const pos = positions[node.id];
            if (!pos) return null;

            const isSelected = selected === node.id;
            const isDimmed   = highlightedIds && !highlightedIds.has(node.id);
            const r = node.type === "attacker" ? 22 : node.type === "attacktype" ? 18 : node.type === "region" ? 14 : 16;

            return (
              <motion.g key={node.id} style={{ cursor: "pointer" }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: isDimmed ? 0.12 : 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                onClick={e => { e.stopPropagation(); setSelected(selected === node.id ? null : node.id); }}>

                {isSelected && (
                  <motion.circle cx={pos.x} cy={pos.y} r={r + 12}
                    fill={node.color} fillOpacity={0.12}
                    stroke={node.color} strokeOpacity={0.4} strokeWidth={1.5}
                    animate={{ r: [r + 10, r + 16, r + 10] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}

                <circle cx={pos.x} cy={pos.y} r={r}
                  fill={node.color} fillOpacity={isSelected ? 0.3 : 0.15}
                  stroke={node.color} strokeWidth={isSelected ? 2.5 : 1.5}
                />
                <circle cx={pos.x} cy={pos.y} r={r * 0.35}
                  fill={node.color} fillOpacity={isSelected ? 1 : 0.6} />

                {node.type === "attacker" && node.count > 0 && (
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={8} fontWeight="700" fontFamily="monospace">
                    {node.count}
                  </text>
                )}

                <text
                  x={pos.x + (node.type === "sector" ? r + 6 : -r - 6)}
                  y={pos.y}
                  textAnchor={node.type === "sector" ? "start" : "end"}
                  dominantBaseline="middle"
                  fill={isDimmed ? "rgba(255,255,255,0.1)" : isSelected ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)"}
                  fontSize={node.type === "attacker" ? 10 : 9}
                  fontWeight={isSelected ? "700" : "400"}
                  fontFamily="Inter, sans-serif"
                >
                  {node.label.length > 18 ? node.label.substring(0, 17) + "…" : node.label}
                </text>

                {node.type !== "attacker" && !isDimmed && (
                  <text
                    x={pos.x + (node.type === "sector" ? r + 6 : -r - 6)}
                    y={pos.y + 11}
                    textAnchor={node.type === "sector" ? "start" : "end"}
                    dominantBaseline="middle"
                    fill={node.color} fontSize={7.5}
                    fontFamily="monospace" fontWeight="600"
                  >
                    {node.count} incident{node.count !== 1 ? "s" : ""}
                  </text>
                )}
              </motion.g>
            );
          })}
        </svg>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground/40">No connections found for this filter</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 px-1">
        <LegendItem color="#ef4444" label="Threat Actor (size = incidents)" shape="circle-large" />
        <LegendItem color="#a855f7" label="Attack Type"                     shape="circle" />
        <LegendItem color="#06b6d4" label="State / Region"                  shape="circle-sm" />
        <LegendItem color="#f59e0b" label="Industry Target"                 shape="circle" />
        <LegendItem color="rgba(255,255,255,0.4)" label="Edge thickness = frequency" shape="line" />
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
                style={{ backgroundColor: `${selectedNode.color}20`, border: `2px solid ${selectedNode.color}40`, color: selectedNode.color }}>
                {selectedNode.label.substring(0, 3).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-foreground font-heading">{selectedNode.label}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                    style={{ backgroundColor: `${selectedNode.color}15`, color: selectedNode.color }}>
                    {selectedNode.type === "attacker"   ? selectedNode.actorType
                      : selectedNode.type === "attacktype" ? "Attack Vector"
                      : selectedNode.type === "region"     ? "Region / State"
                      : "Industry Sector"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mb-3">
                  <span className="text-xs text-muted-foreground">
                    <span className="text-foreground font-semibold">{selectedNode.count}</span> incident{selectedNode.count !== 1 ? "s" : ""}
                  </span>
                  {selectedNode.origin && <span className="text-xs text-muted-foreground">Origin: <span className="text-foreground">{selectedNode.origin}</span></span>}
                  {selectedNode.city   && <span className="text-xs text-muted-foreground">City: <span className="text-foreground">{selectedNode.city}</span></span>}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-2">
                    Connected to ({connectedNodes.length} nodes)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {connectedNodes.map(n => (
                      <button key={n.id} onClick={() => setSelected(n.id)}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all hover:opacity-80"
                        style={{ backgroundColor: `${n.color}15`, color: n.color, border: `1px solid ${n.color}30` }}>
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => setSelected(null)} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground/30 font-mono text-center">
        {nodes.length} nodes · {edges.length} connections · Click any node to trace its links
      </p>
    </div>
  );
}

function LegendItem({ color, label, shape }) {
  return (
    <div className="flex items-center gap-2">
      {shape === "line"
        ? <div className="w-6" style={{ backgroundColor: color, height: "2px" }} />
        : <div className={`rounded-full flex-shrink-0 ${shape === "circle-large" ? "w-4 h-4" : shape === "circle-sm" ? "w-2.5 h-2.5" : "w-3 h-3"}`}
            style={{ backgroundColor: color }} />
      }
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
