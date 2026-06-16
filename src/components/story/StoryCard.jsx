import { motion } from "framer-motion";

export default function StoryCard({ step, title, insight, detail, color = "#ec4899", icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 overflow-hidden group hover:border-border transition-all duration-300"
    >
      {/* Color accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      {/* BG glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" style={{ background: `radial-gradient(ellipse at top left, ${color}08, transparent 70%)` }} />

      <div className="relative flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold font-mono border" style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, color }}>
            {step}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {Icon && <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />}
            <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>
          </div>
          <p className="text-lg font-bold mb-1.5 font-heading" style={{ color }}>{insight}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}