import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const regions = [
  {
    region: "NA", fullName: "North America", incidents: "12,371", breaches: "8,426",
    topPatterns: "System Intrusion, Social Engineering, Basic Web App (87% of breaches)",
    actors: "External 88%, Internal 12%", motives: "Financial 98%, Espionage 3%",
    data: "Credentials 36%, Personal 9%, Other 8%",
    access: "Exploitation of vulnerabilities 30%, Credential abuse 20%, Phishing 12%",
    misc: "Third-party 43%, Human element 59%", color: "#ef4444",
  },
  {
    region: "EMEA", fullName: "Europe, Middle East & Africa", incidents: "8,245", breaches: "6,060",
    topPatterns: "System Intrusion, Social Engineering, Miscellaneous Errors (92% of breaches)",
    actors: "External 80%, Internal 20%", motives: "Financial 76%, Espionage 27%",
    data: "Internal 73%, Other 49%, Personal 34%, Secrets 24%",
    access: "Exploitation of vulnerabilities 47%, Phishing 28%, Credential abuse 6%",
    misc: "Third-party 54%, Human element 70%", color: "#f97316",
  },
  {
    region: "APAC", fullName: "Asia Pacific", incidents: "5,229", breaches: "2,855",
    topPatterns: "System Intrusion, Basic Web App, Social Engineering (97% of breaches)",
    actors: "External 99%, Internal 1%", motives: "Financial 70%, Espionage 36%",
    data: "Internal 70%, Credentials 42%, Other 35%, Secrets 30%",
    access: "Exploitation of vulnerabilities 42%, Credential abuse 25%, Phishing 15%",
    misc: "Third-party 69%, Human element 71%", color: "#06b6d4",
  },
  {
    region: "LAC", fullName: "Latin America & Caribbean", incidents: "813", breaches: "718",
    topPatterns: "System Intrusion, Social Engineering, Basic Web App (98% of breaches)",
    actors: "External 99%, Internal 1%", motives: "Financial 90%, Espionage 11%",
    data: "Internal 93%, Credentials 23%, Secrets 24%, Other 3%",
    access: "Exploitation of vulnerabilities 44%, Phishing 20%, Credential abuse 20%",
    misc: "Third-party 74%, Human element 57%", color: "#10b981",
  },
];

export default function RegionalBreachTable() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-2">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Breach Intelligence by Region</h3>
        <p className="text-xs text-muted-foreground">Inspired by VDBIR Table 5. Click a row to expand detail.</p>
      </div>
      {regions.map(r => (
        <div key={r.region} className="rounded-xl border border-border/40 overflow-hidden">
          <button
            className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors text-left"
            onClick={() => setExpanded(expanded === r.region ? null : r.region)}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: `${r.color}18`, color: r.color, border: `1px solid ${r.color}35` }}>
              {r.region}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{r.fullName}</span>
                <span className="text-xs font-mono text-muted-foreground">{r.incidents} incidents</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{r.topPatterns}</p>
            </div>
            <div className="text-right flex-shrink-0 mr-2 hidden sm:block">
              <div className="text-sm font-bold font-mono" style={{ color: r.color }}>{r.breaches}</div>
              <div className="text-xs text-muted-foreground">confirmed</div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform"
              style={{ transform: expanded === r.region ? "rotate(180deg)" : "none" }} />
          </button>
          <AnimatePresence>
            {expanded === r.region && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-border/20 pt-3">
                  {[
                    { label: "Threat Actors", value: r.actors },
                    { label: "Actor Motives", value: r.motives },
                    { label: "Data Compromised", value: r.data },
                    { label: "Initial Access Vectors", value: r.access },
                    { label: "Additional Factors", value: r.misc },
                  ].map(field => (
                    <div key={field.label} className="p-3 rounded-lg bg-white/[0.02] border border-border/20">
                      <p className="text-xs text-muted-foreground/60 uppercase tracking-wide mb-1">{field.label}</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{field.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}