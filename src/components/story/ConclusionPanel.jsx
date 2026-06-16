import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Shield, Zap, Target, Lock } from "lucide-react";

const findings = [
  {
    icon: Target,
    color: "#ec4899",
    title: "Geographic Concentration",
    text: "The USA bears the brunt — 52% of ransomware victims — making it the undisputed primary target, far outpacing all other nations combined in the English-speaking world.",
  },
  {
    icon: Building2Icon,
    color: "#a855f7",
    title: "No Safe Industry",
    text: "Business services, manufacturing, and consumer goods collectively represent 31% of targets. The 31% 'Others' signals no sector is immune — attackers spray broadly.",
  },
  {
    icon: Zap,
    color: "#06b6d4",
    title: "Windows Dominance = Mega Attack Surface",
    text: "89.97% of malware runs on Windows. This isn't just a statistic — it's the fundamental reason EXE files dominate at 68% of all malware delivery mechanisms.",
  },
  {
    icon: TrendingUp,
    color: "#f59e0b",
    title: "AI Fuels the Fire",
    text: "ChatGPT leads AI mention spikes correlated with cyber events. The DeepSeek launch triggered massive discourse — AI tools are increasingly cited in threat contexts.",
  },
  {
    icon: AlertTriangle,
    color: "#f43f5e",
    title: "Interactive Intrusions Rising",
    text: "North America accounts for 55% of interactive intrusions — hands-on keyboard attacks that evade automation. These are the most dangerous, targeted operations.",
  },
  {
    icon: Lock,
    color: "#10b981",
    title: "The Human-Bot Balance",
    text: "70% human traffic vs. 30% bot traffic may seem reassuring, but that 30% is automated attack infrastructure. Bot-driven reconnaissance enables the human-driven payloads.",
  },
];

// Fallback component reference
function Building2Icon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  );
}

export default function ConclusionPanel() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5 p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-pink-500/10">
            <Shield className="w-5 h-5 text-pink-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-heading">The 2025 Cyber Threat Narrative</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
          The data tells a cohesive story: <strong className="text-foreground">ransomware has matured into a precision industry</strong>. Attackers aren't random — they concentrate on the wealthiest targets (USA, English-speaking nations), exploit the most ubiquitous OS (Windows), deliver via the most trusted file format (EXE), and they're using AI tools to scale. The 30% bot traffic isn't noise — it's reconnaissance infrastructure for the 52% hit rate against American organizations.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {findings.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="rounded-xl border border-border/40 bg-card/50 p-4 hover:border-border/80 transition-all duration-300 group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${f.color}15` }}>
                <f.icon className="w-4 h-4" style={{ color: f.color }} />
              </div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">{f.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="rounded-2xl border border-border/30 bg-card/30 p-6 text-center"
      >
        <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">The Bottom Line</p>
        <p className="text-lg md:text-xl font-bold text-foreground font-heading leading-tight">
          "Cyber threats in 2025 are not random — they are{" "}
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            systematic, targeted, and increasingly intelligent
          </span>
          ."
        </p>
        <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
          Every data point in this report connects: geography → OS → file type → delivery → industry target. 
          Defenders must think in the same connected, systemic way.
        </p>
      </motion.div>
    </div>
  );
}