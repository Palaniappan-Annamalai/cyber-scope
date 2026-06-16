import { motion } from "framer-motion";
import { Users, Building2, Crosshair, Layers, ArrowRight, Shield } from "lucide-react";

const VIEWS = [
  {
    id: "attacker",
    icon: Users,
    label: "Attacker-Centric",
    subtitle: "Who is behind the attacks?",
    description: "Explore 12 threat actor groups — Nation-States, RaaS syndicates, and cybercriminals — mapped to their campaigns, origins, and methods.",
    color: "#ef4444",
    gradient: "from-red-500/20 to-red-900/5",
    border: "border-red-500/30",
    stats: ["12 Threat Groups", "4 Actor Types", "Nation-State to RaaS"],
  },
  {
    id: "victim",
    icon: Building2,
    label: "Victim-Centric",
    subtitle: "Who gets targeted?",
    description: "Sectors ranked by attack frequency, with breakdown of which threat actors pursue each industry and the most common attack methods used.",
    color: "#06b6d4",
    gradient: "from-cyan-500/20 to-cyan-900/5",
    border: "border-cyan-500/30",
    stats: ["11 Industries", "Healthcare #1 target", "Finance & Gov at risk"],
  },
  {
    id: "attack",
    icon: Crosshair,
    label: "Attack Type",
    subtitle: "How do they attack?",
    description: "Attack vectors ranked by prevalence — Ransomware, Data Breach, APT — each showing which sectors they hit most and which actors deploy them.",
    color: "#a855f7",
    gradient: "from-purple-500/20 to-purple-900/5",
    border: "border-purple-500/30",
    stats: ["10 Attack Types", "Ransomware dominant", "APT rising fast"],
  },
  {
    id: "industry",
    icon: Layers,
    label: "Industry-Based",
    subtitle: "Which sectors are most exposed?",
    description: "Deep-dive into each industry's unique threat landscape — timeline of incidents, attack pattern evolution, and exposure risk scoring.",
    color: "#f59e0b",
    gradient: "from-amber-500/20 to-amber-900/5",
    border: "border-amber-500/30",
    stats: ["55 Incidents", "2001–2025 span", "Risk scoring per sector"],
  },
];

export default function ThreatGraphDashboard({ onSelectView }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-primary/80 uppercase tracking-widest">Threat Intelligence Explorer</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading mb-2">
          Choose Your Perspective
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Explore the same incident data from 4 different angles. Each view tells a different story about the cyber threat landscape.
        </p>
      </div>

      {/* Diamond layout — 2x2 grid that visually forms a diamond */}
      <div className="relative max-w-3xl mx-auto">
        {/* Center connector lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-full bg-gradient-to-b from-transparent via-border/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </div>
        {/* Center badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-14 h-14 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {VIEWS.map((v, i) => (
            <motion.button
              key={v.id}
              initial={{ opacity: 0, scale: 0.9, y: i < 2 ? -20 : 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => onSelectView(v.id)}
              className={`group relative rounded-2xl border ${v.border} bg-gradient-to-br ${v.gradient} p-5 text-left hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at ${i % 2 === 0 ? "top left" : "top right"}, ${v.color}12, transparent 70%)` }} />

              <div className="relative">
                {/* Icon + label */}
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${v.color}18`, border: `1px solid ${v.color}30` }}>
                    <v.icon className="w-5 h-5" style={{ color: v.color }} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/70 group-hover:translate-x-1 transition-all duration-200 mt-1" />
                </div>

                <h3 className="text-base font-bold text-foreground font-heading mb-0.5">{v.label}</h3>
                <p className="text-xs font-medium mb-2" style={{ color: v.color }}>{v.subtitle}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{v.description}</p>

                {/* Stats pills */}
                <div className="flex flex-wrap gap-1.5">
                  {v.stats.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-md font-medium"
                      style={{ backgroundColor: `${v.color}15`, color: v.color }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <p className="text-center text-xs text-muted-foreground/40 font-mono">
        55 incidents · 2001–2025 · 12 threat actors · 11 sectors
      </p>
    </div>
  );
}