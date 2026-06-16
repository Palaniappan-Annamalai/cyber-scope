import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, Crosshair, Layers, ArrowLeft } from "lucide-react";
import ThreatGraphDashboard from "./ThreatGraphDashboard";
import AttackerView from "./AttackerView";
import VictimView from "./VictimView";
import AttackTypeView from "./AttackTypeView";
import IndustryView from "./IndustryView";

const VIEW_META = {
  attacker:  { label: "Attacker-Centric",  icon: Users,      color: "#ef4444", subtitle: "Who is behind the attacks?" },
  victim:    { label: "Victim-Centric",     icon: Building2,  color: "#06b6d4", subtitle: "Who gets targeted?" },
  attack:    { label: "Attack Type",        icon: Crosshair,  color: "#a855f7", subtitle: "How do they attack?" },
  industry:  { label: "Industry-Based",     icon: Layers,     color: "#f59e0b", subtitle: "Which sectors are most exposed?" },
};

const VIEW_COMPONENTS = {
  attacker: AttackerView,
  victim:   VictimView,
  attack:   AttackTypeView,
  industry: IndustryView,
};

export default function ThreatGraphExplorer({ country = "US" }) {
  const [activeView, setActiveView] = useState(null);

  const meta = activeView ? VIEW_META[activeView] : null;
  const ViewComponent = activeView ? VIEW_COMPONENTS[activeView] : null;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!activeView ? (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <ThreatGraphDashboard onSelectView={setActiveView} />
          </motion.div>
        ) : (
          <motion.div key={activeView} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Sub-header */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setActiveView(null)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/40 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
                All Views
              </button>

              {/* View switcher pills */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(VIEW_META).map(([id, m]) => (
                  <button key={id} onClick={() => setActiveView(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 ${activeView === id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground hover:border-border/60"}`}>
                    <m.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* View title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${meta.color}15`, border: `1px solid ${meta.color}25` }}>
                <meta.icon className="w-5 h-5" style={{ color: meta.color }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground font-heading">{meta.label}</h2>
                <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
              </div>
            </div>

            {/* Active view — pass country */}
            <ViewComponent country={country} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}