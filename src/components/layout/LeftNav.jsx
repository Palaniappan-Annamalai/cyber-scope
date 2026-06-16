import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Network, ChevronRight } from "lucide-react";
import { useGlobe } from "../../context/GlobeContext";
import { SECTOR_COLORS, ATTACK_COLORS } from "../../lib/colors";
import SparkLine from "../shared/SparkLine";

const SECTOR_KEYS = ["Finance","Healthcare","Energy","Government","Retail","Telecom","Defence","Transport","Education","Media","Technology"];
const ATTACK_KEYS = ["Ransomware","Data Breach","APT","Phishing","Malware","DDoS","Supply Chain","Credential","Zero-Day","Wiper"];
const REGION_KEYS = ["Americas","EMEA","Oceania","Asia"];
const SEVERITY_KEYS = ["Critical","High","Medium","Low"];
const SEV_COLORS  = { Critical:"#ef4444",High:"#f97316",Medium:"#eab308",Low:"#22c55e" };
const REGION_COLORS = { Americas:"#34d399",EMEA:"#f59e0b",Oceania:"#22d3ee",Asia:"#e879f9" };
const THREAT_COUNTRIES = [
  { code:"US",label:"United States",flag:"🇺🇸" },
  { code:"GB",label:"United Kingdom",flag:"🇬🇧" },
  { code:"CN",label:"China",         flag:"🇨🇳" },
  { code:"RU",label:"Russia",        flag:"🇷🇺" },
  { code:"KP",label:"North Korea",   flag:"🇰🇵" },
  { code:"IR",label:"Iran",          flag:"🇮🇷" },
];

function FilterGroup({ iconBg, iconColor, icon, title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border/40">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.025] transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
            style={{ background: iconBg, color: iconColor }}>{icon}</div>
          <span className="text-[11px] font-semibold" style={{ color: "#b0c4d8" }}>{title}</span>
        </div>
        <ChevronRight size={10} className="text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }}
            exit={{ height:0,opacity:0 }} transition={{ duration:0.2,ease:[.25,.46,.45,.94] }}
            style={{ overflow:"hidden" }}>
            <div className="px-2 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, color, active, onClick, showSparkline }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left"
      style={{ background: active ? `${color}14` : "transparent" }}>
      <div className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color, opacity: active ? 1 : 0.22,
          boxShadow: active ? `0 0 5px ${color}` : "none" }} />
      <span className="text-[11px] flex-1"
        style={{ color: active ? "rgba(220,232,245,0.92)" : "rgba(122,150,181,0.45)" }}>
        {label}
      </span>
      {showSparkline && active &&
        <SparkLine sector={label} color={color} width={30} height={11} />}
    </button>
  );
}

export default function LeftNav({ globeRef }) {
  const {
    activeSectors, setActiveSectors, smartToggle,
    activeAttacks, setActiveAttacks,
    activeRegions, setActiveRegions,
    activeSeverity, setActiveSeverity,
    activeView, setActiveView,
    threatGraphCountry, setThreatGraphCountry,
    openRightPanel, rightPanel,
  } = useGlobe();

  /* ── Filter header group click → open right panel ─────────────── */
  /* Clicking the GROUP HEADER (Sectors / Attack Types / Regions)    */
  /* opens the right panel with that donut. Individual chip clicks   */
  /* toggle the filter on/off without opening the panel.             */

  const handleGroupClick = (type) => {
    openRightPanel(type, { group: type, key: null });
  };

  const handleSectorChip = (key) => {
    smartToggle(setActiveSectors, key, SECTOR_KEYS);
    globeRef?.current?.setFilters?.();
    // Update panel heading but keep panel showing the sectors donut
    if (rightPanel === "sectors") {
      openRightPanel("sectors", { group: "sectors", key });
    }
  };

  const handleAttackChip = (key) => {
    smartToggle(setActiveAttacks, key, ATTACK_KEYS);
    globeRef?.current?.setFilters?.();
    if (rightPanel === "attacks") {
      openRightPanel("attacks", { group: "attacks", key });
    }
  };

  const handleRegionChip = (key) => {
    setActiveRegions(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    globeRef?.current?.setFilters?.();
    if (rightPanel === "regions") {
      openRightPanel("regions", { group: "regions", key });
    }
  };

  const handleSevChip = (key) => {
    smartToggle(setActiveSeverity, key, ["Critical","High","Medium","Low"]);
    globeRef?.current?.setFilters?.();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-border/40"
      style={{ width:216, background:"rgba(11,14,24,0.97)", flexShrink:0 }}>

      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40 flex-shrink-0">
        <div className="text-[11px] font-semibold" style={{ color:"#dce8f5" }}>Filters</div>
        <div className="text-[9px] mt-0.5" style={{ color:"#3d556e" }}>
          Click group header → open panel
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth:"thin", scrollbarColor:"#1e2538 transparent" }}>

        {/* ── SECTORS ── clicking the header opens the right panel */}
        <div className="border-b border-border/40">
          <button
            onClick={() => handleGroupClick("sectors")}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.025] transition-colors"
            style={{ borderLeft: rightPanel==="sectors" ? "2px solid #fbbf24" : "2px solid transparent" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
                style={{ background:"rgba(251,191,36,.15)", color:"#fbbf24" }}>⬡</div>
              <span className="text-[11px] font-semibold" style={{ color:"#b0c4d8" }}>Sectors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] px-1.5 py-0.5 rounded"
                style={{ background:"rgba(251,191,36,.12)", color:"#fbbf24" }}>
                {rightPanel==="sectors" ? "● open" : "→ panel"}
              </span>
              <ChevronRight size={10} className="text-muted-foreground" style={{ transform:"rotate(0deg)" }}/>
            </div>
          </button>
          {/* chips still toggle filter */}
          <div className="px-2 pb-2">
            {SECTOR_KEYS.map(k => (
              <FilterChip key={k} label={k} color={SECTOR_COLORS[k]||"#7a96b5"}
                active={activeSectors.has(k)} showSparkline
                onClick={() => handleSectorChip(k)} />
            ))}
          </div>
        </div>

        {/* ── ATTACK TYPES ── */}
        <div className="border-b border-border/40">
          <button
            onClick={() => handleGroupClick("attacks")}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.025] transition-colors"
            style={{ borderLeft: rightPanel==="attacks" ? "2px solid #ef4444" : "2px solid transparent" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
                style={{ background:"rgba(239,68,68,.15)", color:"#ef4444" }}>⚡</div>
              <span className="text-[11px] font-semibold" style={{ color:"#b0c4d8" }}>Attack Types</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] px-1.5 py-0.5 rounded"
                style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }}>
                {rightPanel==="attacks" ? "● open" : "→ panel"}
              </span>
              <ChevronRight size={10} className="text-muted-foreground"/>
            </div>
          </button>
          <div className="px-2 pb-2">
            {ATTACK_KEYS.map(k => (
              <FilterChip key={k} label={k} color={ATTACK_COLORS[k]||"#7a96b5"}
                active={activeAttacks.has(k)}
                onClick={() => handleAttackChip(k)} />
            ))}
          </div>
        </div>

        {/* ── REGIONS ── */}
        {/* ── REGIONS — header opens right panel ── */}
        <div className="border-b border-border/40">
          <button
            onClick={() => handleGroupClick("regions")}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.025] transition-colors"
            style={{ borderLeft: rightPanel==="regions" ? "2px solid #34d399" : "2px solid transparent" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
                style={{ background:"rgba(52,211,153,.15)", color:"#34d399" }}>◉</div>
              <span className="text-[11px] font-semibold" style={{ color:"#b0c4d8" }}>Regions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] px-1.5 py-0.5 rounded"
                style={{ background:"rgba(52,211,153,.12)", color:"#34d399" }}>
                {rightPanel==="regions" ? "● open" : "→ panel"}
              </span>
              <ChevronRight size={10} className="text-muted-foreground"/>
            </div>
          </button>
          <div className="px-2 pb-2">
            {REGION_KEYS.map(k => (
              <FilterChip key={k} label={k} color={REGION_COLORS[k]||"#7a96b5"}
                active={activeRegions.has(k)}
                onClick={() => handleRegionChip(k)} />
            ))}
          </div>
        </div>

        {/* ── SEVERITY ── */}
        <FilterGroup icon="▲" iconBg="rgba(168,85,247,.15)" iconColor="#a855f7" title="Severity">
          <div className="grid grid-cols-2 gap-1 mt-1">
            {SEVERITY_KEYS.map(k => (
              <button key={k} onClick={() => handleSevChip(k)}
                className="py-1.5 text-center text-[9px] font-semibold rounded-lg border transition-all"
                style={{
                  borderColor: activeSeverity.has(k) ? SEV_COLORS[k] : `${SEV_COLORS[k]}30`,
                  background:  activeSeverity.has(k) ? `${SEV_COLORS[k]}22` : "transparent",
                  color:       activeSeverity.has(k) ? "#fff" : SEV_COLORS[k],
                }}>{k}</button>
            ))}
          </div>
        </FilterGroup>

        {/* ── VIEWS DIVIDER ── */}
        <div className="px-4 pt-3 pb-1.5">
          <div className="text-[8px] font-semibold tracking-[2px] uppercase" style={{ color:"#3d556e" }}>Views</div>
        </div>
        <div className="border-t border-border/40" />

        {/* ── TRENDS ── */}
        <button onClick={() => setActiveView(activeView==="trends" ? "globe" : "trends")}
          className="w-full px-3 py-3 flex items-center gap-2 border-b border-border/40 transition-all"
          style={{
            background: activeView==="trends" ? "rgba(96,165,250,0.08)" : "transparent",
            borderLeft: activeView==="trends" ? "2px solid #60a5fa" : "2px solid transparent",
          }}>
          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
            style={{ background:"rgba(96,165,250,0.12)" }}>
            <TrendingUp size={11} style={{ color:"#60a5fa" }}/>
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold"
              style={{ color: activeView==="trends" ? "#93c5fd" : "#7a96b5" }}>Trends</div>
            <div className="text-[9px]" style={{ color:"#3d556e" }}>AI model activity</div>
          </div>
          {activeView==="trends" &&
            <span className="ml-auto text-[9px]" style={{ color:"#60a5fa" }}>← globe</span>}
        </button>

        {/* ── THREAT GRAPH ── */}
        <div>
          <button onClick={() => setActiveView(activeView==="threatgraph" ? "globe" : "threatgraph")}
            className="w-full px-3 py-3 flex items-center gap-2 transition-all"
            style={{
              background: activeView==="threatgraph" ? "rgba(236,72,153,0.08)" : "transparent",
              borderLeft: activeView==="threatgraph" ? "2px solid #ec4899" : "2px solid transparent",
            }}>
            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ background:"rgba(236,72,153,0.12)" }}>
              <Network size={11} style={{ color:"#ec4899" }}/>
            </div>
            <div className="text-left">
              <div className="text-[11px] font-semibold"
                style={{ color: activeView==="threatgraph" ? "#f9a8d4" : "#7a96b5" }}>Threat Graph</div>
              <div className="text-[9px]" style={{ color:"#3d556e" }}>Attacker connections</div>
            </div>
            {activeView==="threatgraph" &&
              <span className="ml-auto text-[9px]" style={{ color:"#ec4899" }}>← globe</span>}
          </button>
          <AnimatePresence>
            {activeView==="threatgraph" && (
              <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }}
                exit={{ height:0,opacity:0 }} transition={{ duration:0.2 }}
                style={{ overflow:"hidden" }} className="px-3 pb-3">
                <div className="grid grid-cols-2 gap-1.5 ml-7">
                  {THREAT_COUNTRIES.map(c => (
                    <button key={c.code} onClick={() => setThreatGraphCountry(c.code)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                      style={{
                        background: threatGraphCountry===c.code ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.04)",
                        color:      threatGraphCountry===c.code ? "#ec4899" : "#7a96b5",
                        border:`1px solid ${threatGraphCountry===c.code ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.07)"}`,
                      }}>
                      <span>{c.flag}</span><span>{c.code}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
