import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, TrendingUp, Shield, Target, Users } from "lucide-react";
import { globalEvents } from "../../lib/relationshipData";
import { usaCyberThreats, attackColors } from "../../lib/cyberData";

export default function GlobalEventsTimeline() {
  const [selected, setSelected] = useState(null);

  const selectedEvent = globalEvents.find((_, i) => i === selected);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Global Events → Cyber Attack Correlation</h3>
        <p className="text-xs text-muted-foreground">Click an event to see the linked cyber incidents and attack patterns.</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

        <div className="space-y-3">
          {globalEvents.map((ev, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <button
                onClick={() => setSelected(selected === i ? null : i)}
                className={`relative w-full text-left pl-14 pr-4 py-4 rounded-2xl border transition-all duration-300
                  ${selected === i ? "border-border bg-card/90" : "border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/50"}`}>
                {/* Dot */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ backgroundColor: `${ev.color}20`, borderColor: ev.color }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ev.color }} />
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{ev.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono" style={{ color: ev.color }}>{ev.year}</span>
                      <span className="text-sm font-semibold text-foreground">{ev.event}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ev.surge}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {ev.attackTypes.map(at => (
                        <span key={at} className="text-xs px-2 py-0.5 rounded-md font-medium"
                          style={{ backgroundColor: `${attackColors[at] || "#6b7280"}18`, color: attackColors[at] || "#6b7280" }}>
                          {at}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-1 transition-transform ${selected === i ? "rotate-90" : ""}`} />
                </div>
              </button>

              <AnimatePresence>
                {selected === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }} className="overflow-hidden">
                    <EventDetail event={ev} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventDetail({ event }) {
  const linkedIncidents = usaCyberThreats.filter(inc => event.incidents.includes(inc.id));

  return (
    <div className="ml-14 mt-2 mb-1 rounded-2xl border border-border/40 bg-card/60 p-5 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatMini icon={Target} label="Targets" value={event.targets.join(", ")} color={event.color} />
        <StatMini icon={Users} label="Threat Actors" value={event.actors.join(", ")} color={event.color} />
        <StatMini icon={TrendingUp} label="Attack Surge" value={event.surge} color={event.color} />
      </div>

      {/* Linked incidents */}
      {linkedIncidents.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Linked Incidents from Dataset
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {linkedIncidents.map(inc => (
              <div key={inc.id} className="p-3 rounded-xl border border-border/30 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: attackColors[inc.attack] || "#6b7280" }} />
                  <span className="text-xs font-semibold text-foreground truncate">{inc.threat}</span>
                  <span className="text-xs font-mono text-muted-foreground/40 ml-auto flex-shrink-0">{inc.year}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{ backgroundColor: `${attackColors[inc.attack] || "#6b7280"}18`, color: attackColors[inc.attack] || "#6b7280" }}>
                    {inc.attack}
                  </span>
                  <span className="text-xs text-muted-foreground/60">{inc.sector}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{inc.main_point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attack type breakdown */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">Attack Vector Breakdown</p>
        <div className="flex flex-wrap gap-2">
          {event.attackTypes.map(at => (
            <div key={at} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
              style={{ borderColor: `${attackColors[at] || "#6b7280"}30`, backgroundColor: `${attackColors[at] || "#6b7280"}08` }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: attackColors[at] || "#6b7280" }} />
              <span className="text-xs text-foreground">{at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatMini({ icon: IconComp, label, value, color }) {
  const Icon = IconComp;
  return (
    <div className="rounded-xl border border-border/30 bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-foreground leading-relaxed">{value}</p>
    </div>
  );
}