import { motion } from "framer-motion";
import { useState } from "react";

export default function AnimatedBar({ label, value, maxValue, index, color = "primary", rank, onClick }) {
  const [hovered, setHovered] = useState(false);
  const percentage = (value / maxValue) * 100;

  const colorMap = {
    primary: { bar: "from-pink-600 to-pink-500", glow: "shadow-pink-500/20", text: "text-pink-400", bg: "bg-pink-500/5" },
    accent: { bar: "from-purple-600 to-fuchsia-500", glow: "shadow-purple-500/20", text: "text-purple-400", bg: "bg-purple-500/5" },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group relative flex items-center gap-4 py-2.5 px-3 rounded-xl transition-all duration-300 ${onClick ? "cursor-pointer" : "cursor-default"} ${hovered ? c.bg : "hover:bg-white/[0.02]"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick(label)}
    >
      <span className="text-xs font-mono text-muted-foreground/40 w-5 text-right tabular-nums">{rank}</span>
      <div className="w-48 md:w-56 flex-shrink-0 text-right pr-3">
        <span className={`text-sm font-medium transition-colors duration-200 ${hovered ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </span>
        {onClick && hovered && <span className="ml-1 text-xs text-primary/60">→ details</span>}
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-8 rounded-lg bg-white/[0.03] overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.3 + index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`h-full rounded-lg bg-gradient-to-r ${c.bar} relative overflow-hidden`}
          >
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: "200%" }}
              transition={{ duration: 2, delay: 1 + index * 0.06 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          </motion.div>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`absolute inset-0 rounded-lg shadow-lg ${c.glow}`} style={{ width: `${percentage}%` }} />
          )}
        </div>
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8 + index * 0.06 }}
          className={`text-sm font-semibold font-mono tabular-nums min-w-[3.5rem] ${hovered ? c.text : "text-foreground/70"} transition-colors duration-200`}
        >
          {value}%
        </motion.span>
      </div>
    </motion.div>
  );
}