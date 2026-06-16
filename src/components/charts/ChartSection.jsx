import { motion } from "framer-motion";
import AnimatedBar from "./AnimatedBar";

export default function ChartSection({ title, subtitle, data, color, icon: Icon, onBarClick }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const totalItems = data.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      {/* Card */}
      <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none" />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3 mb-1.5">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight font-heading">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-mono text-muted-foreground/50">
              {totalItems} categories
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-xs font-mono text-muted-foreground/50">
              Top: {data[0]?.label} ({data[0]?.value}%)
            </span>
          </div>
        </div>

        {/* Bars */}
        <div className="relative px-3 py-4 space-y-0">
          {data.map((item, index) => (
            <AnimatedBar
              key={item.label}
              label={item.label}
              value={item.value}
              maxValue={maxValue}
              index={index}
              color={color}
              rank={index + 1}
              onClick={onBarClick}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}