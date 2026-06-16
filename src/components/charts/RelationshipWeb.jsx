import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const nodes = [
  { id: "ransomware", label: "Ransomware", x: 50, y: 50, size: 60, color: "#ec4899", type: "center" },
  { id: "usa", label: "USA 52%", x: 20, y: 25, size: 44, color: "#f43f5e", type: "country" },
  { id: "uk", label: "UK 5%", x: 10, y: 55, size: 28, color: "#fb7185", type: "country" },
  { id: "rest", label: "Rest 23%", x: 20, y: 78, size: 36, color: "#fda4af", type: "country" },
  { id: "business", label: "Business Svc", x: 75, y: 20, size: 32, color: "#a855f7", type: "industry" },
  { id: "manufacturing", label: "Manufacturing", x: 85, y: 45, size: 30, color: "#c084fc", type: "industry" },
  { id: "healthcare", label: "Healthcare", x: 78, y: 68, size: 28, color: "#d8b4fe", type: "industry" },
  { id: "others_ind", label: "Others 31%", x: 65, y: 82, size: 34, color: "#e879f9", type: "industry" },
  { id: "windows", label: "Windows 90%", x: 48, y: 15, size: 36, color: "#06b6d4", type: "tech" },
  { id: "exe", label: ".exe 68%", x: 35, y: 65, size: 30, color: "#0891b2", type: "tech" },
  { id: "bot", label: "Bot 30%", x: 62, y: 35, size: 26, color: "#f59e0b", type: "bot" },
];

const edges = [
  { from: "ransomware", to: "usa", strength: 5 },
  { from: "ransomware", to: "uk", strength: 2 },
  { from: "ransomware", to: "rest", strength: 3 },
  { from: "ransomware", to: "business", strength: 2.5 },
  { from: "ransomware", to: "manufacturing", strength: 2 },
  { from: "ransomware", to: "healthcare", strength: 2 },
  { from: "ransomware", to: "others_ind", strength: 3 },
  { from: "ransomware", to: "windows", strength: 4 },
  { from: "ransomware", to: "exe", strength: 3.5 },
  { from: "ransomware", to: "bot", strength: 1.5 },
  { from: "usa", to: "business", strength: 1 },
  { from: "usa", to: "healthcare", strength: 1 },
  { from: "windows", to: "exe", strength: 3 },
];

const typeLabels = { center: "Core", country: "Geography", industry: "Industry", tech: "Technology", bot: "Traffic" };
const typeColors = { center: "#ec4899", country: "#f43f5e", industry: "#a855f7", tech: "#06b6d4", bot: "#f59e0b" };

export default function RelationshipWeb() {
  const [activeNode, setActiveNode] = useState(null);
  const [filter, setFilter] = useState("all");
  const W = 600, H = 400;

  const getCoord = (node, axis) => (axis === "x" ? (node.x / 100) * W : (node.y / 100) * H);

  const visibleNodes = filter === "all" ? nodes : nodes.filter(n => n.type === "center" || n.type === filter);
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));

  const activeEdges = activeNode
    ? edges.filter(e => e.from === activeNode || e.to === activeNode)
    : visibleEdges;

  const connectedIds = activeNode
    ? new Set(activeEdges.flatMap(e => [e.from, e.to]))
    : new Set(visibleIds);

  const types = ["all", "country", "industry", "tech", "bot"];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => { setFilter(t); setActiveNode(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 capitalize ${
              filter === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-border/80"
            }`}
          >
            {t === "all" ? "All Connections" : typeLabels[t]}
          </button>
        ))}
      </div>

      {/* SVG web */}
      <div className="rounded-xl border border-border/40 bg-black/20 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 420 }}>
          <defs>
            {nodes.map(n => (
              <radialGradient key={n.id} id={`grad-${n.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={n.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={n.color} stopOpacity="0.4" />
              </radialGradient>
            ))}
          </defs>

          {/* Edges */}
          {visibleEdges.map((edge, i) => {
            const from = nodes.find(n => n.id === edge.from);
            const to = nodes.find(n => n.id === edge.to);
            if (!from || !to) return null;
            const isActive = activeNode
              ? edge.from === activeNode || edge.to === activeNode
              : true;
            return (
              <motion.line
                key={`${edge.from}-${edge.to}`}
                x1={getCoord(from, "x")} y1={getCoord(from, "y")}
                x2={getCoord(to, "x")} y2={getCoord(to, "y")}
                stroke={isActive ? from.color : "rgba(255,255,255,0.05)"}
                strokeWidth={isActive ? edge.strength * 0.8 : 0.5}
                strokeOpacity={isActive ? 0.5 : 0.1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: i * 0.05 }}
              />
            );
          })}

          {/* Nodes */}
          {visibleNodes.map((node, i) => {
            const x = getCoord(node, "x");
            const y = getCoord(node, "y");
            const isConnected = connectedIds.has(node.id);
            const isActive = activeNode === node.id;
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: isConnected ? 1 : 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ cursor: "pointer", transformOrigin: `${x}px ${y}px` }}
                onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
              >
                <circle
                  cx={x} cy={y}
                  r={isActive ? node.size / 2 + 4 : node.size / 2}
                  fill={`url(#grad-${node.id})`}
                  stroke={isActive ? node.color : "transparent"}
                  strokeWidth={2}
                  style={{ filter: isActive ? `drop-shadow(0 0 12px ${node.color})` : "none", transition: "all 0.2s" }}
                />
                <text
                  x={x} y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={Math.max(8, node.size * 0.18)}
                  fontWeight="600"
                  style={{ pointerEvents: "none", fontFamily: "Inter, sans-serif" }}
                >
                  {node.label.split(" ")[0]}
                </text>
                {node.label.includes(" ") && (
                  <text
                    x={x} y={y + node.size * 0.14}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize={Math.max(7, node.size * 0.14)}
                    style={{ pointerEvents: "none", fontFamily: "Inter, sans-serif" }}
                  >
                    {node.label.split(" ").slice(1).join(" ")}
                  </text>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(typeLabels).filter(([k]) => k !== "center").map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeColors[type] }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}