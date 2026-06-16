import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useGlobe } from "../context/GlobeContext";
import LeftNav from "../components/layout/LeftNav";
import GlobeCanvas from "../components/globe/GlobeCanvas";
import TimelineSlider from "../components/globe/TimelineSlider";
import RightPanel from "../components/panels/RightPanel";
import ThreatGraphExplorer from "../components/threatgraph/ThreatGraphExplorer";
import ConnectionGraph from "../components/threatgraph/ConnectionGraph";
import TimelineChart from "../components/charts/TimelineChart";
import { useState } from "react";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const aiTimelineData = months.map((month, i) => {
  const d = {
    month,
    ChatGPT: Math.round(800 + Math.sin(i * 0.7) * 200 + i * 40),
    Gemini:  Math.round(300 + Math.sin(i * 0.5 + 1) * 100 + i * 10),
    Grok:    Math.round(150 + Math.sin(i * 0.9 + 2) * 80),
    DeepSeek:Math.round(100 + Math.sin(i * 1.1 + 0.5) * 60),
    Claude:  Math.round(200 + Math.sin(i * 0.6 + 1.5) * 70),
  };
  if (month === "Feb") { d.DeepSeek = 2800; d.ChatGPT = 1600; }
  if (month === "Jun") { d.ChatGPT = 1950; }
  if (month === "Aug") { d.ChatGPT = 2400; }
  if (month === "Nov") { d.ChatGPT = 1800; }
  return d;
});

function BackButton({ onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/40 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all mb-6"
    >
      <ArrowLeft size={13} />
      Back to Globe
    </button>
  );
}

function TrendsView({ onBack }) {
  const [activeModels, setActiveModels] = useState(["ChatGPT","Gemini","Grok","DeepSeek","Claude"]);
  const toggleModel = (m) => setActiveModels(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="h-full overflow-y-auto"
      style={{ padding: "24px 28px" }}
    >
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10"><span className="text-primary text-lg">🤖</span></div>
          <div>
            <h2 className="text-xl font-bold font-heading text-foreground">AI Model Trends — 2025</h2>
            <p className="text-xs text-muted-foreground">Monthly mention analysis · Toggle models · Dashed lines = key cyber events</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
        <TimelineChart data={aiTimelineData} activeModels={activeModels} onToggleModel={toggleModel} />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[
          { title: "ChatGPT Dominance", val: "~60%", desc: "Share of AI mentions across all 12 months of 2025", color: "#ef4444" },
          { title: "DeepSeek Peak",     val: "2,800", desc: "Mentions in February — highest single-model spike of 2025", color: "#06b6d4" },
          { title: "AI + Cyber Events", val: "6 events", desc: "Cyber incidents directly correlated with AI mention spikes", color: "#a855f7" },
        ].map(c => (
          <div key={c.title} className="rounded-xl border border-border/40 bg-card/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">{c.title}</p>
            <p className="text-2xl font-bold font-mono mb-1" style={{ color: c.color }}>{c.val}</p>
            <p className="text-xs text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const COUNTRY_DATA = {
  US: {
    name:"United States", flag:"🇺🇸",
    stats:[ {l:"Ransomware incidents",v:"52% of global"}, {l:"Critical infra attacks",v:"#1 target"}, {l:"Gov sector breaches",v:"31% of total"} ],
  },
  GB: {
    name:"United Kingdom", flag:"🇬🇧",
    stats:[ {l:"Ransomware share",v:"5% global"}, {l:"NHS disruption events",v:"14 major"}, {l:"Fin sector breaches",v:"top 3 EMEA"} ],
  },
  CN: {
    name:"China (Threat Actor)", flag:"🇨🇳",
    stats:[ {l:"Nation-state APT groups",v:"APT41, Volt/Salt Typhoon"}, {l:"Primary targets",v:"US Gov, Telecom, Defence"}, {l:"TTPs",v:"Living-off-the-land, Zero-days"} ],
  },
  RU: {
    name:"Russia (Threat Actor)", flag:"🇷🇺",
    stats:[ {l:"Active groups",v:"Cozy Bear, Sandworm, ALPHV"}, {l:"Primary targets",v:"NATO Gov, Energy, Ukraine"}, {l:"TTPs",v:"Supply chain, Wiper, RaaS"} ],
  },
  KP: {
    name:"North Korea (Threat Actor)", flag:"🇰🇵",
    stats:[ {l:"Primary group",v:"Lazarus"}, {l:"Primary targets",v:"Finance, Crypto, Defence"}, {l:"TTPs",v:"Ransomware, Wiper, Phishing"} ],
  },
  IR: {
    name:"Iran (Threat Actor)", flag:"🇮🇷",
    stats:[ {l:"Primary group",v:"MuddyWater, APT33"}, {l:"Primary targets",v:"Energy, Gov, Telecom"}, {l:"TTPs",v:"Destructive malware, APT"} ],
  },
};

function ThreatGraphView({ country, onBack }) {
  const info = COUNTRY_DATA[country] || COUNTRY_DATA.US;
  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
      className="h-full overflow-y-auto" style={{ padding:"24px 28px" }}
    >
      <BackButton onClick={onBack} />
      {/* Country header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-2">
          <span style={{ fontSize:28 }}>{info.flag}</span>
          <div>
            <h2 className="text-xl font-bold font-heading text-foreground">
              Threat Graph — {info.name}
            </h2>
            <p className="text-xs text-muted-foreground">Attacker → Attack → Region → Industry connections</p>
          </div>
        </div>
        {/* Country stats */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {info.stats.map((s,i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card/50 p-3">
              <div className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wide">{s.l}</div>
              <div className="text-xs font-semibold text-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Connection Graph */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Connection Graph</h3>
        <p className="text-xs text-muted-foreground mb-4">Filter by threat actor · Click nodes to trace links</p>
        <ConnectionGraph country={country} />
      </div>
      {/* Threat Graph Explorer */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
        <ThreatGraphExplorer country={country} />
      </div>
    </motion.div>
  );
}

export default function GlobePage() {
  const globeRef = useRef(null);
  const { activeView, setActiveView, threatGraphCountry, rightPanel } = useGlobe();

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative" }}>
      {/* Left Nav — always visible */}
      <LeftNav globeRef={globeRef} />

      {/* Centre area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {activeView === "globe" && (
            <motion.div
              key="globe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0 }}
            >
              {/* Globe canvas — takes space minus timeline at bottom */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 52 }}>
                <GlobeCanvas ref={globeRef} />
              </div>
              {/* Timeline slider at bottom */}
              <TimelineSlider globeRef={globeRef} />
            </motion.div>
          )}

          {activeView === "trends" && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ position: "absolute", inset: 0, background: "hsl(225,25%,6%)" }}
            >
              {/* Background blobs */}
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: "5%", left: "20%", width: 500, height: 500, background: "rgba(236,72,153,0.025)", borderRadius: "50%", filter: "blur(80px)" }} />
                <div style={{ position: "absolute", bottom: "5%", right: "20%", width: 500, height: 500, background: "rgba(168,85,247,0.025)", borderRadius: "50%", filter: "blur(80px)" }} />
              </div>
              <TrendsView onBack={() => setActiveView("globe")} />
            </motion.div>
          )}

          {activeView === "threatgraph" && (
            <motion.div
              key="threatgraph"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ position: "absolute", inset: 0, background: "hsl(225,25%,6%)" }}
            >
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: "5%", left: "20%", width: 500, height: 500, background: "rgba(236,72,153,0.025)", borderRadius: "50%", filter: "blur(80px)" }} />
                <div style={{ position: "absolute", bottom: "5%", right: "20%", width: 500, height: 500, background: "rgba(168,85,247,0.025)", borderRadius: "50%", filter: "blur(80px)" }} />
              </div>
              <ThreatGraphView
                country={threatGraphCountry}
                onBack={() => setActiveView("globe")}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right dynamic panel — only on globe view */}
        {activeView === "globe" && <RightPanel />}
      </div>
    </div>
  );
}
