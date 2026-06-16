import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, AlertTriangle, Calendar, MapPin, Shield } from "lucide-react";
import { usaCyberThreats, severityColors, attackColors } from "@/lib/cyberData";

// Map country bar-chart labels to states/filters in the dataset
const countryToFilter = {
  "United States": null, // show all
};

// For the ransomware/country charts, clicking a country shows US incidents filtered
// Since all data is US-based, we'll filter by region context — for country bars we show ransomware incidents
const ransomwareByState = {};
usaCyberThreats.filter(d => d.attack === "Ransomware").forEach(d => {
  if (!ransomwareByState[d.state]) ransomwareByState[d.state] = [];
  ransomwareByState[d.state].push(d);
});

// For each country label from the bar chart, map to a meaningful filter
const countryContext = {
  "United States": {
    note: "52% of global ransomware victims. Showing all US ransomware incidents from the dataset.",
    incidents: usaCyberThreats.filter(d => d.attack === "Ransomware"),
  },
  "United Kingdom": {
    note: "5% of global ransomware victims. UK represents the largest non-US English-speaking target.",
    incidents: [],
  },
  "Canada": { note: "4% of global ransomware victims. Closely linked to US supply chains.", incidents: [] },
  "Germany": { note: "4% of global ransomware victims. Largest EU economy and manufacturing hub.", incidents: [] },
  "France": { note: "2% of global ransomware victims.", incidents: [] },
  "Italy": { note: "2% of global ransomware victims.", incidents: [] },
  "Spain": { note: "2% of global ransomware victims.", incidents: [] },
  "Brazil": { note: "2% of global ransomware victims. Largest target in Latin America.", incidents: [] },
  "Australia": { note: "2% of global ransomware victims.", incidents: [] },
  "India": { note: "2% of global ransomware victims. Rising tech sector target.", incidents: [] },
  "Rest of the World": { note: "23% of global victims spread across remaining nations.", incidents: [] },
};

export default function CountryDrilldown({ country, onClose }) {
  if (!country) return null;
  const ctx = countryContext[country] || { note: "Data not available.", incidents: [] };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl max-h-[80vh] rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-border/40">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-pink-500/10"><Shield className="w-4 h-4 text-pink-400" /></div>
                <span className="text-xs font-mono text-pink-400/70 uppercase tracking-widest">Ransomware Breakdown</span>
              </div>
              <h2 className="text-xl font-bold font-heading text-foreground">{country}</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-lg">{ctx.note}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-5">
            {ctx.incidents.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No granular incident data available for this region.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">The dataset focuses on documented US incidents (2001–2025).</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-4">
                  {ctx.incidents.length} documented ransomware incidents in the USA dataset (2001–2025)
                </p>
                {ctx.incidents.map((inc, i) => (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-border/40 bg-card/60 p-4 hover:border-border/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${severityColors[inc.severity]}18`, color: severityColors[inc.severity], border: `1px solid ${severityColors[inc.severity]}35` }}>
                          {inc.severity}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
                          {inc.sector}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{inc.year}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <MapPin className="w-3 h-3" />{inc.state} · {inc.city}
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{inc.threat}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{inc.main_point}</p>
                    <div className="mt-2 text-xs text-muted-foreground/50">Origin: {inc.origin}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}