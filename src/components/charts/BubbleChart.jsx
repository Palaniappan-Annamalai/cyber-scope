import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BubbleChart({ data, title }) {
  const [hovered, setHovered] = useState(null);
  const maxVal = Math.max(...data.map(d => d.value));

  // Layout bubbles in a packed way
  const positions = [
    { x: 25, y: 50 },
    { x: 52, y: 65 },
    { x: 72, y: 45 },
    { x: 58, y: 28 },
    { x: 38, y: 22 },
    { x: 82, y: 65 },
    { x: 15, y: 72 },
    { x: 65, y: 78 },
    { x: 45, y: 42 },
    { x: 88, y: 35 },
    { x: 28, y: 38 },
    { x: 78, y: 80 },
  ];

  return (
    <div className="relative w-full" style={{ paddingBottom: "70%" }}>
      <div className="absolute inset-0">
        {data.map((item, i) => {
          const pos = positions[i] || { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 };
          const size = Math.max(40, (item.value / maxVal) * 180);
          const isHovered = hovered === i;
          return (
            <motion.div
              key={item.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute flex items-center justify-center rounded-full cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: size,
                height: size,
                transform: "translate(-50%, -50%)",
                background: item.gradient || item.color,
                boxShadow: isHovered ? `0 0 30px ${item.glowColor || item.color}60` : "none",
                zIndex: isHovered ? 10 : 1,
                transition: "box-shadow 0.3s, transform 0.3s",
              }}
              whileHover={{ scale: 1.12 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="text-center px-2">
                <div className="font-bold text-white font-mono" style={{ fontSize: Math.max(10, size * 0.13) }}>
                  {item.value}%
                </div>
                <div className="text-white/80 font-medium" style={{ fontSize: Math.max(8, size * 0.1) }}>
                  {item.label}
                </div>
              </div>
            </motion.div>
          );
        })}
        <AnimatePresence>
          {hovered !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl px-4 py-2 z-20 pointer-events-none"
            >
              <p className="text-sm font-semibold text-foreground">{data[hovered]?.label}</p>
              <p className="text-xs text-muted-foreground">{data[hovered]?.value}% of malware samples</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}