import { motion } from "framer-motion";

export default function StatsCard({ label, value, sublabel, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-5 overflow-hidden transition-all duration-300 hover:border-primary/20">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.03] to-purple-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground mt-1.5 font-heading">{value}</p>
            {sublabel && (
              <p className="text-xs text-muted-foreground/60 mt-1">{sublabel}</p>
            )}
          </div>
          {Icon && (
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}