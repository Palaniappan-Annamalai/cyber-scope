import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DonutChart({ data, title, subtitle, size = 200 }) {
  const [hovered, setHovered] = useState(null);
  const radius = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size * 0.18;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const segments = data.map((item, i) => {
    const offset = cumulative;
    cumulative += item.value;
    return { ...item, offset, index: i };
  });

  const total = data.reduce((s, d) => s + d.value, 0);
  const activeItem = hovered !== null ? data[hovered] : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
          {segments.map((seg, i) => {
            const dashArray = (seg.value / total) * circumference;
            const dashOffset = circumference - (seg.offset / total) * circumference;
            const isHovered = hovered === i;
            return (
              <motion.circle
                key={seg.label}
                cx={cx} cy={cy} r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${dashArray - 1.5} ${circumference - dashArray + 1.5}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ cursor: "pointer", filter: isHovered ? `drop-shadow(0 0 8px ${seg.color})` : "none" }}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${dashArray - 1.5} ${circumference - dashArray + 1.5}` }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {activeItem ? (
              <motion.div key={activeItem.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center px-2">
                <div className="text-xl font-bold font-mono" style={{ color: activeItem.color }}>{activeItem.value}%</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight text-center">{activeItem.label}</div>
              </motion.div>
            ) : (
              <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-2xl font-bold text-foreground font-heading">{total}%</div>
                <div className="text-xs text-muted-foreground">total</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 w-full max-w-xs">
        {data.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center gap-1.5 cursor-pointer transition-opacity duration-200 ${hovered !== null && hovered !== i ? "opacity-30" : "opacity-100"}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground truncate">{item.label}</span>
            <span className="text-xs font-mono font-semibold ml-auto" style={{ color: item.color }}>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}