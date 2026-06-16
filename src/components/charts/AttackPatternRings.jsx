import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const years = [
  {
    year: "2024", yearColor: "#f97316",
    patterns: [
      { label: "System Intrusion", value: 36, color: "#ef4444" },
      { label: "Misc Errors", value: 25, color: "#eab308" },
      { label: "Social Engineering", value: 22, color: "#f97316" },
      { label: "Basic Web App", value: 9, color: "#f59e0b" },
      { label: "Privilege Misuse", value: 8, color: "#a855f7" },
    ],
  },
  {
    year: "2025", yearColor: "#ef4444",
    patterns: [
      { label: "System Intrusion", value: 53, color: "#ef4444" },
      { label: "Basic Web App", value: 18, color: "#f59e0b" },
      { label: "Social Engineering", value: 17, color: "#f97316" },
      { label: "Misc Errors", value: 12, color: "#eab308" },
      { label: "Privilege Misuse", value: 7, color: "#a855f7" },
    ],
  },
  {
    year: "2026", yearColor: "#ec4899",
    patterns: [
      { label: "System Intrusion", value: 61, color: "#ef4444" },
      { label: "Social Engineering", value: 17, color: "#f97316" },
      { label: "Basic Web App", value: 10, color: "#f59e0b" },
      { label: "Misc Errors", value: 8, color: "#eab308" },
      { label: "Privilege Misuse", value: 3, color: "#a855f7" },
    ],
  },
];

function RingChart({ data, year, yearColor }) {
  const [hov, setHov] = useState(null);
  const size = 150;
  const radius = size / 2 - 18;
  const cx = size / 2, cy = size / 2;
  const strokeW = 26;
  const circ = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="font-bold text-xl mb-2" style={{ color: yearColor }}>{year}</div>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} />
          {data.map((item, i) => {
            const offset = cumulative;
            cumulative += item.value;
            const dash = (item.value / total) * circ;
            const dashOffset = circ - (offset / total) * circ;
            const isHov = hov === i;
            return (
              <motion.circle
                key={item.label}
                cx={cx} cy={cy} r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={isHov ? strokeW + 6 : strokeW}
                strokeDasharray={`${dash - 2} ${circ - dash + 2}`}
                strokeDashoffset={dashOffset}
                style={{ cursor: "pointer", filter: isHov ? `drop-shadow(0 0 6px ${item.color})` : "none", transition: "stroke-width 0.2s" }}
                initial={{ strokeDasharray: `0 ${circ}` }}
                animate={{ strokeDasharray: `${dash - 2} ${circ - dash + 2}` }}
                transition={{ duration: 0.9, delay: i * 0.1 }}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {hov !== null ? (
              <motion.div key={hov} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-base font-bold font-mono" style={{ color: data[hov].color }}>{data[hov].value}%</div>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground/40 font-mono">top 5</motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-2 space-y-1 w-full max-w-[160px]">
        {data.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 text-xs cursor-default transition-opacity ${hov !== null && hov !== i ? "opacity-30" : ""}`}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground flex-1 truncate">{item.label}</span>
            <span className="font-mono font-semibold flex-shrink-0" style={{ color: item.color }}>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AttackPatternRings() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Attack Pattern Evolution 2024–2026</h3>
        <p className="text-xs text-muted-foreground">System Intrusion rising from 36% → 61% in 3 years. Hover a segment to explore.</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map(y => <RingChart key={y.year} data={y.patterns} year={y.year} yearColor={y.yearColor} />)}
      </div>
    </div>
  );
}