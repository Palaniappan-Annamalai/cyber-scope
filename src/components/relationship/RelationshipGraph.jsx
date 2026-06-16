import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, Crosshair, Layers, X, Info } from "lucide-react";
import { enrichedIncidents, attackerGroups } from "../../lib/relationshipData";
import { attackColors } from "../../lib/cyberData";

const VIEWS = [
  { id: "attacker",  label: "Attacker-Centric",   icon: Users,       color: "#ef4444" },
  { id: "victim",    label: "Victim-Centric",      icon: Building2,   color: "#06b6d4" },
  { id: "attack",    label: "Attack Type",         icon: Crosshair,   color: "#a855f7" },
  { id: "industry",  label: "Industry-Based",      icon: Layers,      color: "#f59e0b" },
];

const SECTOR_COLORS = {
  Technology: "#06b6d4", Healthcare: "#10b981", Finance: "#f59e0b",
  Government: "#8b5cf6", Energy: "#f97316", Retail: "#ec4899",
  Education: "#84cc16", Defence: "#ef4444", Telecom: "#0ea5e9",
  Media: "#d946ef", Transport: "#fb923c",
};

function useForceLayout(nodes, edges, width, height) {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (!nodes.length) return;
    const pos = {};
    // Radial layout by group
    const groups = [...new Set(nodes.map(n => n.group))];
    nodes.forEach((n, i) => {
      const gi = groups.indexOf(n.group);
      const groupAngle = (gi / groups.length) * Math.PI * 2;
      const countInGroup = nodes.filter(x => x.group === n.group).length;
      const idx = nodes.filter(x => x.group === n.group).indexOf(n);
      const spread = countInGroup > 1 ? (idx / (countInGroup - 1) - 0.5) * 1.2 : 0;
      const r = n.type === "hub" ? 0 : n.type === "mid" ? width * 0.22 : width * 0.38;
      pos[n.id] = {
        x: width / 2 + r * Math.cos(groupAngle + spread),
        y: height / 2 + r * Math.sin(groupAngle + spread),
      };
    });
    setPositions(pos);
  }, [nodes.map(n => n.id).join(","), width, height]);

  return positions;
}

export default function RelationshipGraph() {
  const [view, setView] = useState("attacker");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 700, h: 420 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.offsetWidth, h: Math.min(containerRef.current.offsetWidth * 0.6, 480) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { nodes, edges } = useMemo(() => buildGraph(view, dims.w, dims.h), [view, dims.w, dims.h]);
  const positions = useForceLayout(nodes, edges, dims.w, dims.h);

  const activeNode = selected || hovered;
  const highlightedIds = useMemo(() => {
    if (!activeNode) return null;
    const connected = new Set([activeNode]);
    edges.forEach(e => {
      if (e.from === activeNode) connected.add(e.to);
      if (e.to === activeNode) connected.add(e.from);
    });
    return connected;
  }, [activeNode, edges]);

  const nodeInfo = activeNode ? nodes.find(n => n.id === activeNode) : null;

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex flex-wrap gap-2">
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => { setView(v.id); setSelected(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-200
              ${view === v.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-border/80"}`}>
            <v.icon className="w-3.5 h-3.5" />
            {v.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden" ref={containerRef}>
          <svg width={dims.w} height={dims.h} className="block">
            <defs>
              <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.015)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <rect width={dims.w} height={dims.h} fill="url(#bg-grad)" />
            {/* Edges */}
            {edges.map((e, i) => {
              const from = positions[e.from];
              const to = positions[e.to];
              if (!from || !to) return null;
              const isActive = highlightedIds?.has(e.from) && highlightedIds?.has(e.to);
              const opacity = highlightedIds ? (isActive ? 0.7 : 0.05) : 0.18;
              return (
                <motion.line key={i}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={e.color || "#ffffff"}
                  strokeWidth={isActive ? 2 : 1}
                  strokeOpacity={opacity}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity }}
                  transition={{ duration: 0.8, delay: i * 0.01 }}
                />
              );
            })}
            {/* Nodes */}
            {nodes.map(node => {
              const pos = positions[node.id];
              if (!pos) return null;
              const r = node.type === "hub" ? 32 : node.type === "mid" ? 20 : 12;
              const dimmed = highlightedIds && !highlightedIds.has(node.id);
              return (
                <motion.g key={node.id} style={{ cursor: "pointer" }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: dimmed ? 0.15 : 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => setSelected(selected === node.id ? null : node.id)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}>
                  {/* Glow */}
                  {(selected === node.id || hovered === node.id) && (
                    <circle cx={pos.x} cy={pos.y} r={r + 10} fill={node.color} fillOpacity={0.15} />
                  )}
                  <circle cx={pos.x} cy={pos.y} r={r} fill={node.color} fillOpacity={0.15}
                    stroke={node.color} strokeWidth={selected === node.id ? 2.5 : 1.5} />
                  {node.type === "hub" ? (
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                      fill={node.color} fontSize={10} fontWeight="700" fontFamily="monospace">
                      {node.short || node.label.substring(0, 3).toUpperCase()}
                    </text>
                  ) : (
                    <circle cx={pos.x} cy={pos.y} r={r * 0.45} fill={node.color} fillOpacity={0.7} />
                  )}
                  {/* Label */}
                  {(node.type !== "leaf" || r > 14) && (
                    <text x={pos.x} y={pos.y + r + 10} textAnchor="middle"
                      fill="rgba(255,255,255,0.6)" fontSize={8.5} fontFamily="Inter, sans-serif">
                      {node.label.length > 16 ? node.label.substring(0, 15) + "…" : node.label}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* Info Panel */}
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-5 flex flex-col">
          <AnimatePresence mode="wait">
            {nodeInfo ? (
              <motion.div key={nodeInfo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: nodeInfo.color }} />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{nodeInfo.type}</span>
                  </div>
                  {selected && <button onClick={() => setSelected(null)}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2 font-heading">{nodeInfo.label}</h3>
                {nodeInfo.meta && (
                  <div className="space-y-1.5 mb-3">
                    {Object.entries(nodeInfo.meta).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-xs">
                        <span className="text-muted-foreground/60 capitalize w-20 flex-shrink-0">{k}:</span>
                        <span className="text-foreground">{Array.isArray(v) ? v.join(", ") : v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {nodeInfo.incidents && (
                  <div>
                    <p className="text-xs text-muted-foreground/60 mb-2">Related Incidents</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {nodeInfo.incidents.map(inc => (
                        <div key={inc.id} className="p-2 rounded-lg bg-white/[0.03] text-xs">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-muted-foreground/40">{inc.year}</span>
                            <span className="font-semibold text-foreground">{inc.threat}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{inc.main_point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  Connected to <span className="text-foreground font-semibold">{edges.filter(e => e.from === nodeInfo.id || e.to === nodeInfo.id).length}</span> nodes
                </p>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
                <Info className="w-8 h-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground/60">Click or hover any node to explore relationships</p>
                <p className="text-xs text-muted-foreground/30 mt-1">{nodes.length} nodes · {edges.length} connections</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <NodeLegend view={view} />
    </div>
  );
}

function NodeLegend({ view }) {
  const entries = view === "attacker"
    ? attackerGroups.map(a => ({ label: a.label, color: a.color }))
    : view === "victim" || view === "industry"
      ? Object.entries(SECTOR_COLORS).map(([k, v]) => ({ label: k, color: v }))
      : Object.entries(attackColors).map(([k, v]) => ({ label: k, color: v }));

  return (
    <div className="flex flex-wrap gap-3">
      {entries.map(e => (
        <div key={e.label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-xs text-muted-foreground">{e.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Graph builders ────────────────────────────────────────────────────────────
function buildGraph(view, w, h) {
  switch (view) {
    case "attacker":  return buildAttackerGraph();
    case "victim":    return buildVictimGraph();
    case "attack":    return buildAttackTypeGraph();
    case "industry":  return buildIndustryGraph();
    default:          return { nodes: [], edges: [] };
  }
}

function buildAttackerGraph() {
  const nodes = [];
  const edges = [];

  attackerGroups.forEach(ag => {
    const incs = enrichedIncidents.filter(i => i.attacker === ag.id);
    nodes.push({
      id: ag.id, label: ag.label, color: ag.color, type: "hub", group: ag.id,
      short: ag.label.substring(0, 4).toUpperCase(),
      meta: { origin: ag.origin, type: ag.type, "attack types": ag.attacks },
      incidents: incs,
    });
    incs.forEach(inc => {
      const nodeId = `inc-${inc.id}`;
      if (!nodes.find(n => n.id === nodeId)) {
        nodes.push({
          id: nodeId, label: inc.threat, color: attackColors[inc.attack] || "#6b7280",
          type: "leaf", group: ag.id,
          meta: { year: inc.year, attack: inc.attack, sector: inc.sector, severity: inc.severity },
          incidents: [inc],
        });
      }
      edges.push({ from: ag.id, to: nodeId, color: ag.color });
    });
  });

  return { nodes, edges };
}

function buildVictimGraph() {
  const nodes = [];
  const edges = [];
  const sectors = [...new Set(enrichedIncidents.map(i => i.sector))];

  sectors.forEach(sec => {
    const color = SECTOR_COLORS[sec] || "#6b7280";
    const incs = enrichedIncidents.filter(i => i.sector === sec);
    nodes.push({
      id: `sec-${sec}`, label: sec, color, type: "hub", group: `sec-${sec}`,
      short: sec.substring(0, 3).toUpperCase(),
      meta: { incidents: incs.length, "top attack": getMostCommon(incs.map(i => i.attack)) },
      incidents: incs,
    });
    incs.forEach(inc => {
      const nodeId = `inc-${inc.id}`;
      if (!nodes.find(n => n.id === nodeId)) {
        nodes.push({
          id: nodeId, label: inc.threat, color: attackColors[inc.attack] || "#6b7280",
          type: "leaf", group: `sec-${sec}`,
          meta: { year: inc.year, attack: inc.attack, severity: inc.severity },
          incidents: [inc],
        });
      }
      edges.push({ from: `sec-${sec}`, to: nodeId, color });
    });
  });

  return { nodes, edges };
}

function buildAttackTypeGraph() {
  const nodes = [];
  const edges = [];
  const attacks = [...new Set(enrichedIncidents.map(i => i.attack))];

  attacks.forEach(atk => {
    const color = attackColors[atk] || "#6b7280";
    const incs = enrichedIncidents.filter(i => i.attack === atk);
    nodes.push({
      id: `atk-${atk}`, label: atk, color, type: "hub", group: `atk-${atk}`,
      short: atk.substring(0, 3).toUpperCase(),
      meta: { count: incs.length, "top sector": getMostCommon(incs.map(i => i.sector)), "top year": getMostCommon(incs.map(i => String(i.year))) },
      incidents: incs,
    });

    // Also link to sectors
    const sectors = [...new Set(incs.map(i => i.sector))];
    sectors.forEach(sec => {
      const secId = `sec-${sec}`;
      if (!nodes.find(n => n.id === secId)) {
        const sColor = SECTOR_COLORS[sec] || "#6b7280";
        const sIncs = enrichedIncidents.filter(i => i.sector === sec);
        nodes.push({
          id: secId, label: sec, color: sColor, type: "mid", group: `atk-${atk}`,
          meta: { sector: sec },
          incidents: sIncs,
        });
      }
      edges.push({ from: `atk-${atk}`, to: secId, color });
    });
  });

  return { nodes, edges };
}

function buildIndustryGraph() {
  const nodes = [];
  const edges = [];
  const sectors = [...new Set(enrichedIncidents.map(i => i.sector))];

  sectors.forEach(sec => {
    const color = SECTOR_COLORS[sec] || "#6b7280";
    const incs = enrichedIncidents.filter(i => i.sector === sec);
    nodes.push({
      id: `sec-${sec}`, label: sec, color, type: "hub", group: `sec-${sec}`,
      short: sec.substring(0, 3).toUpperCase(),
      meta: { incidents: incs.length, "top attack": getMostCommon(incs.map(i => i.attack)), years: `${Math.min(...incs.map(i=>i.year))}–${Math.max(...incs.map(i=>i.year))}` },
      incidents: incs,
    });

    // Link sectors to attack types used against them
    const attacks = [...new Set(incs.map(i => i.attack))];
    attacks.forEach(atk => {
      const atkId = `atk-${atk}`;
      if (!nodes.find(n => n.id === atkId)) {
        nodes.push({
          id: atkId, label: atk, color: attackColors[atk] || "#6b7280", type: "mid", group: `sec-${sec}`,
          meta: { "attack type": atk },
          incidents: enrichedIncidents.filter(i => i.attack === atk),
        });
      }
      edges.push({ from: `sec-${sec}`, to: atkId, color });
    });
  });

  return { nodes, edges };
}

function getMostCommon(arr) {
  const freq = {};
  arr.forEach(x => { freq[x] = (freq[x] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
}