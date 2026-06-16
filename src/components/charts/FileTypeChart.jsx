import { useState } from "react";
import { motion } from "framer-motion";

const fileTypes = [
  { ext: "exe", value: 68.11, color: "#ec4899", desc: "Native Windows executable — highest trust, highest risk" },
  { ext: "msi", value: 10.54, color: "#f97316", desc: "Windows installer, often bypasses AV heuristics" },
  { ext: "iso", value: 9.47, color: "#06b6d4", desc: "Disk image bypassing Mark-of-the-Web protections" },
  { ext: "zip", value: 3.16, color: "#6366f1", desc: "Compressed archive concealing payloads" },
  { ext: "js", value: 1.46, color: "#eab308", desc: "JavaScript dropper disguised as utility scripts" },
  { ext: "rar", value: 1.16, color: "#f43f5e", desc: "Archive frequently used in phishing kits" },
  { ext: "dll", value: 1.50, color: "#10b981", desc: "Dynamic-link library for DLL sideloading attacks" },
  { ext: "vbs", value: 1.11, color: "#a855f7", desc: "Legacy Visual Basic script, active in macro chains" },
  { ext: "doc", value: 1.09, color: "#3b82f6", desc: "Office document with macro or exploit payload" },
  { ext: "hta", value: 0.99, color: "#8b5cf6", desc: "HTML Application executed with elevated trust" },
  { ext: "lnk", value: 0.70, color: "#fb7185", desc: "Windows shortcut used as initial stager" },
];

export default function FileTypeChart() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="space-y-1">
      {fileTypes.map((item, i) => {
        const isHov = hovered === i;
        const pct = (item.value / fileTypes[0].value) * 100;
        return (
          <motion.div
            key={item.ext}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-default transition-all duration-200 ${isHov ? "bg-white/[0.04]" : ""}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Rank */}
            <span className="text-xs font-mono text-muted-foreground/40 w-4 text-right flex-shrink-0">{i + 1}</span>

            {/* Extension badge */}
            <div
              className="w-12 flex-shrink-0 flex items-center justify-center py-1 rounded-lg text-xs font-bold font-mono"
              style={{
                backgroundColor: `${item.color}18`,
                color: item.color,
                border: `1px solid ${item.color}35`,
                boxShadow: isHov ? `0 0 8px ${item.color}30` : "none",
              }}
            >
              .{item.ext}
            </div>

            {/* Bar + description */}
            <div className="flex-1 min-w-0">
              <div className="h-5 rounded-md bg-white/[0.03] overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="h-full rounded-md"
                  style={{ background: `linear-gradient(90deg, ${item.color}cc, ${item.color}55)` }}
                />
              </div>
              {isHov && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground/70 mt-1 leading-tight"
                >
                  {item.desc}
                </motion.p>
              )}
            </div>

            {/* Value */}
            <span
              className="text-sm font-bold font-mono tabular-nums w-14 text-right flex-shrink-0"
              style={{ color: isHov ? item.color : "rgba(255,255,255,0.55)" }}
            >
              {item.value}%
            </span>
          </motion.div>
        );
      })}
      <div className="mt-3 p-3 rounded-xl bg-pink-500/5 border border-pink-500/20">
        <p className="text-xs text-muted-foreground">
          <span className="text-pink-400 font-semibold">.exe dominates at 68.1%</span> — directly enabled by Windows' 90% OS market share.
          The rise of .iso (9.5%) and .msi (10.5%) reflects attackers bypassing SmartScreen controls.
        </p>
      </div>
    </div>
  );
}