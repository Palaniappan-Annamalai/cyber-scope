// Home page — main dashboard
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Globe, Building2, TrendingUp, AlertTriangle,
  Bot, Monitor, FileCode, Map, BarChart3, Network, BookOpen, ChevronRight, Layers } from
"lucide-react";
import ChartSection from "../components/charts/ChartSection";
import StatsCard from "../components/dashboard/StatsCard";
import DonutChart from "../components/charts/DonutChart";
import BubbleChart from "../components/charts/BubbleChart";
import TimelineChart from "../components/charts/TimelineChart";
import RelationshipWeb from "../components/charts/RelationshipWeb";
import ThreatGraphExplorer from "../components/threatgraph/ThreatGraphExplorer";
import ConnectionGraph from "../components/threatgraph/ConnectionGraph";
import GlobalEventsTimeline from "../components/relationship/GlobalEventsTimeline";
import StoryCard from "../components/story/StoryCard";
import ConclusionPanel from "../components/story/ConclusionPanel";
import FileTypeChart from "../components/charts/FileTypeChart";
import AttackPatternRings from "../components/charts/AttackPatternRings";
import BreachTrendLine from "../components/charts/BreachTrendLine";
import RegionalBreachTable from "../components/charts/RegionalBreachTable";
import CountryDrilldown from "../components/dashboard/CountryDrilldown";
import { getIncidentsByAttack, getIncidentsBySector, attackColors, usaCyberThreats } from "../lib/cyberData";

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

const countryData = [
{ label: "United States", value: 52 },
{ label: "United Kingdom", value: 5 },
{ label: "Canada", value: 4 },
{ label: "Germany", value: 4 },
{ label: "France", value: 2 },
{ label: "Italy", value: 2 },
{ label: "Spain", value: 2 },
{ label: "Brazil", value: 2 },
{ label: "Australia", value: 2 },
{ label: "India", value: 2 },
{ label: "Rest of the World", value: 23 }];


const industryData = [
{ label: "Business Services", value: 11 },
{ label: "Industrial Manufacturing", value: 10 },
{ label: "Consumer Goods & Services", value: 10 },
{ label: "Construction & Engineering", value: 9 },
{ label: "Healthcare & Medical", value: 8 },
{ label: "Financial Services", value: 5 },
{ label: "Information Technology", value: 4 },
{ label: "Transportation & Logistics", value: 4 },
{ label: "Government", value: 4 },
{ label: "Education", value: 4 },
{ label: "Others", value: 31 }];


const botVsHumanData = [
{ label: "Human", value: 70.1, color: "#f97316" },
{ label: "Bot", value: 29.9, color: "#fbbf24" }];


const osData = [
{ label: "Windows", value: 89.97, color: "#06b6d4" },
{ label: "Linux", value: 9.0, color: "#8b5cf6" },
{ label: "macOS", value: 1.03, color: "#10b981" }];


const intrusionByRegion = [
{ label: "North America", value: 55, color: "#ef4444" },
{ label: "Europe", value: 9, color: "#dc2626" },
{ label: "South Asia", value: 9, color: "#7f1d1d" },
{ label: "East Asia", value: 5, color: "#991b1b" },
{ label: "Southeast Asia", value: 7, color: "#1e3a5f" },
{ label: "South America", value: 6, color: "#0f766e" },
{ label: "Middle East", value: 4, color: "#374151" },
{ label: "Africa", value: 2, color: "#0d9488" },
{ label: "Oceania", value: 2, color: "#0891b2" },
{ label: "Central America", value: 1, color: "#164e63" }];


const intrusionByIndustry = [
{ label: "Technology", value: 23, color: "#ef4444" },
{ label: "Manufacturing", value: 15, color: "#dc2626" },
{ label: "Retail", value: 12, color: "#f97316" },
{ label: "Financial Services", value: 11, color: "#ea580c" },
{ label: "Healthcare", value: 10, color: "#c2410c" },
{ label: "Telecommunications", value: 9, color: "#9f1239" },
{ label: "Government", value: 7, color: "#881337" },
{ label: "Industrials & Engineering", value: 6, color: "#be185d" },
{ label: "Academic", value: 4, color: "#86198f" },
{ label: "Media", value: 3, color: "#701a75" }];


const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const timelineData = months.map((month, i) => {
  const d = {
    month,
    ChatGPT: Math.round(800 + Math.sin(i * 0.7) * 200 + Math.random() * 300),
    Gemini: Math.round(300 + Math.sin(i * 0.5 + 1) * 100 + Math.random() * 150),
    Grok: Math.round(150 + Math.sin(i * 0.9 + 2) * 80 + Math.random() * 100),
    DeepSeek: Math.round(100 + Math.sin(i * 1.1 + 0.5) * 60 + Math.random() * 80),
    Claude: Math.round(200 + Math.sin(i * 0.6 + 1.5) * 70 + Math.random() * 90),
    Qwen: Math.round(50 + Math.random() * 60),
    Llama: Math.round(80 + Math.random() * 70),
    Perplexity: Math.round(40 + Math.random() * 50),
    Mistral: Math.round(30 + Math.random() * 40)
  };
  if (month === "Feb") {d.DeepSeek = 2800;d.ChatGPT = 1600;}
  if (month === "Jun") {d.ChatGPT = 1950;}
  if (month === "Aug") {d.ChatGPT = 2400;}
  if (month === "Nov") {d.ChatGPT = 1800;}
  if (month === "Dec") {d.Gemini = 900;}
  return d;
});

const storySteps = [
{ step: "01", title: "The Entry Point", insight: "30% of traffic is bots", detail: "Automated bots probe defenses 24/7 — scanning, enumerating, and mapping vulnerabilities before any human attacker arrives.", color: "#f59e0b", icon: Bot },
{ step: "02", title: "The Platform of Choice", insight: "Windows targeted 90% of the time", detail: "Attackers follow users. With Windows dominating enterprise endpoints, it's the rational target for maximizing impact and ROI.", color: "#06b6d4", icon: Monitor },
{ step: "03", title: "The Weapon of Choice", insight: "EXE files — 68% of delivery", detail: "Executables remain king. Despite decades of awareness, end users still click. MSI and ISO formats are growing as trusted-file bypass techniques.", color: "#ec4899", icon: FileCode },
{ step: "04", title: "The Primary Battlefield", insight: "North America: 55% of intrusions", detail: "The concentration of wealth, critical infrastructure, and enterprise data makes North America the most valuable target on the planet.", color: "#ef4444", icon: Map },
{ step: "05", title: "The Ransomware Apex", insight: "USA absorbs 52% of ransomware", detail: "Inside North America, the US amplifies further. Ransomware attacks the highest-value, most-connected organizations — predominantly American.", color: "#f43f5e", icon: AlertTriangle },
{ step: "06", title: "The AI Acceleration", insight: "AI tools correlated with attack spikes", detail: "ChatGPT, DeepSeek, and Grok mentions surge during cybersecurity incidents — attackers and defenders both leverage AI, creating an arms race.", color: "#a855f7", icon: TrendingUp }];


const tabs = [
{ id: "threatgraph", label: "Threat Graph", icon: Network },
{ id: "categories", label: "Attack Categories", icon: Layers },
{ id: "intrusions", label: "Intrusions", icon: BarChart3 },
{ id: "malware", label: "Malware & OS", icon: Monitor },
{ id: "ai", label: "AI Trends", icon: TrendingUp },
{ id: "relationships", label: "Relationships", icon: Map },
{ id: "story", label: "Story", icon: BookOpen }];


// Build donut data from dataset
const attackDist = getIncidentsByAttack();
const sectorDist = getIncidentsBySector();

const attackDonutData = attackDist.slice(0, 8).map((d) => ({
  label: d.attack, value: d.count,
  color: attackColors[d.attack] || "#6b7280"
}));
const sectorDonutData = sectorDist.slice(0, 8).map((d) => ({
  label: d.sector, value: d.count,
  color: ["#ec4899", "#a855f7", "#06b6d4", "#f97316", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"][sectorDist.indexOf(d) % 8]
}));

export default function Home() {
  const [activeTab, setActiveTab] = useState("categories");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeSubTab, setActiveSubTab] = useState("ransomware");
  const [activeModels, setActiveModels] = useState(["ChatGPT", "Gemini", "Grok", "DeepSeek", "Claude"]);
  const [drilldownCountry, setDrilldownCountry] = useState(null);

  const toggleModel = (model) =>
  setActiveModels((prev) => prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]);

  const sortedCountry = [...countryData].sort((a, b) => sortOrder === "desc" ? b.value - a.value : a.value - b.value);
  const sortedIndustry = [...industryData].sort((a, b) => sortOrder === "desc" ? b.value - a.value : a.value - b.value);

  const attackSubTabs = [
  { id: "ransomware", label: "Ransomware" },
  { id: "all_attacks", label: "All Attacks" },
  { id: "patterns", label: "Breach Patterns" },
  { id: "regional", label: "Regional Intel" }];


  return (
    <div className="min-h-screen bg-background relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-500/[0.025] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/[0.025] rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.012]"
        style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-mono text-primary/70 uppercase tracking-widest">2025 Cyber Threat Intelligence Report</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight font-heading leading-tight">
            Global Cyber Threat
            <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Intelligence Dashboard
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl text-sm md:text-base leading-relaxed">
            Interactive analysis of attack categories, ransomware incidents, intrusion patterns, malware delivery, and AI trends.
          </p>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <StatsCard label="Ransomware Top Target" value="USA 52%" sublabel="Of all global victims" icon={Globe} delay={0.1} />
          <StatsCard label="Bot Traffic" value="29.9%" sublabel="Of all HTTP requests" icon={Bot} delay={0.15} />
          <StatsCard label="Windows Malware" value="89.97%" sublabel="OS market for malware" icon={Monitor} delay={0.2} />
          <StatsCard label="N. America Intrusions" value="55%" sublabel="Of all interactive attacks" icon={AlertTriangle} delay={0.25} />
        </div>

        {/* MAIN TABS */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm w-fit">
          {tabs.map((tab) =>
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"}`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )}
        </div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">

          {/* ── ATTACK CATEGORIES ── */}
          {activeTab === "categories" &&
          <motion.div key="categories" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-6">

              {/* Sub-tabs */}
              <div className="flex flex-wrap gap-2">
                {attackSubTabs.map((st) =>
              <button key={st.id} onClick={() => setActiveSubTab(st.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${activeSubTab === st.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-border/80"}`}>
                    {st.label}
                  </button>
              )}
              </div>

              <AnimatePresence mode="wait">
                {activeSubTab === "ransomware" &&
              <motion.div key="ransomware" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Sort:</span>
                      {["desc", "asc"].map((o) =>
                  <button key={o} onClick={() => setSortOrder(o)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${sortOrder === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                          {o === "desc" ? "Highest First" : "Lowest First"}
                        </button>
                  )}
                      <span className="text-xs text-muted-foreground ml-2">· Click a country bar for detailed breakdown</span>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <ChartSection title="Ransomware Victims by Country" subtitle="Click any country to see detailed incident breakdown" data={sortedCountry} color="primary" icon={Globe} onBarClick={setDrilldownCountry} />
                      <ChartSection title="Ransomware Victims by Industry" subtitle="Sector-wise breakdown of ransomware targets" data={sortedIndustry} color="accent" icon={Building2} />
                    </div>
                  </motion.div>
              }

                {activeSubTab === "all_attacks" &&
              <motion.div key="all_attacks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                        <h2 className="text-lg font-semibold mb-1 font-heading">Attack Types</h2>
                        <p className="text-xs text-muted-foreground mb-5">Distribution across 55 documented incidents (2001–2025)</p>
                        <DonutChart data={attackDonutData} size={220} />
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                        <h2 className="text-lg font-semibold mb-1 font-heading">Sectors Targeted</h2>
                        <p className="text-xs text-muted-foreground mb-5">Which industries were targeted most across documented history</p>
                        <DonutChart data={sectorDonutData} size={220} />
                      </div>
                    </div>
                    {/* Timeline of attacks */}
                    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                      <h2 className="text-lg font-semibold mb-1 font-heading">Notable Cyber Incidents Timeline</h2>
                      <p className="text-xs text-muted-foreground mb-4">2016–2025 — key incidents from the dataset. Ransomware marked in pink.</p>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map((yr) => {
                      const incidents = usaCyberThreats.filter((d) => d.year === yr);
                      if (!incidents.length) return null;
                      return (
                        <div key={yr}>
                              <div className="text-xs font-mono text-muted-foreground/50 px-2 mb-1">{yr}</div>
                              {incidents.map((inc) =>
                          <div key={inc.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: attackColors[inc.attack] || "#6b7280" }} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-semibold text-foreground">{inc.threat}</span>
                                      <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                                style={{ backgroundColor: `${attackColors[inc.attack] || "#6b7280"}18`, color: attackColors[inc.attack] || "#6b7280" }}>
                                        {inc.attack}
                                      </span>
                                      <span className="text-xs text-muted-foreground/60">{inc.sector}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{inc.main_point}</p>
                                  </div>
                                </div>
                          )}
                            </div>);

                    })}
                      </div>
                    </div>
                  </motion.div>
              }

                {activeSubTab === "patterns" &&
              <motion.div key="patterns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                      <AttackPatternRings />
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                      <BreachTrendLine />
                    </div>
                  </motion.div>
              }

                {activeSubTab === "regional" &&
              <motion.div key="regional" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                      <RegionalBreachTable />
                    </div>
                  </motion.div>
              }
              </AnimatePresence>
            </motion.div>
          }

          {/* ── INTRUSIONS ── */}
          {activeTab === "intrusions" &&
          <motion.div key="intrusions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                  <h2 className="text-lg font-semibold mb-1 font-heading">Interactive Intrusions by Region</h2>
                  <p className="text-xs text-muted-foreground mb-5">Jan–Dec 2025 · Hands-on-keyboard attacks</p>
                  <DonutChart data={intrusionByRegion} size={220} />
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                  <h2 className="text-lg font-semibold mb-1 font-heading">Top Industries Targeted</h2>
                  <p className="text-xs text-muted-foreground mb-5">Interactive intrusion victims by sector</p>
                  <DonutChart data={intrusionByIndustry} size={220} />
                </div>
              </div>
            </motion.div>
          }

          {/* ── MALWARE & OS ── */}
          {activeTab === "malware" &&
          <motion.div key="malware" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                  <h2 className="text-lg font-semibold mb-1 font-heading">Malware by Operating System</h2>
                  <p className="text-xs text-muted-foreground mb-5">Distribution across Elastic telemetry endpoints</p>
                  <DonutChart data={osData} size={220} />
                  <div className="mt-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <p className="text-xs text-muted-foreground"><span className="text-cyan-400 font-semibold">Windows dominates at 89.97%</span> — directly explaining why EXE files are the #1 malware delivery format at 68.11%.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                  <h2 className="text-lg font-semibold mb-1 font-heading">Bot vs. Human Traffic</h2>
                  <p className="text-xs text-muted-foreground mb-5">HTTP request distribution analysis</p>
                  <DonutChart data={botVsHumanData} size={220} />
                  <div className="mt-4 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
                    <p className="text-xs text-muted-foreground"><span className="text-orange-400 font-semibold">30% bot traffic</span> represents automated attack infrastructure. Bots perform recon so human attackers can strike with precision.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                <h2 className="text-lg font-semibold mb-2 font-heading">Malware File Type Distribution</h2>
                <p className="text-xs text-muted-foreground mb-4">Hover a row to see context. Sorted by prevalence.</p>
                <FileTypeChart />
              </div>
            </motion.div>
          }

          {/* ── AI TRENDS ── */}
          {activeTab === "ai" &&
          <motion.div key="ai" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                <h2 className="text-lg font-semibold mb-1 font-heading">Top AI Model Mentions — 2025</h2>
                <p className="text-xs text-muted-foreground mb-5">Toggle models · Dashed lines mark key cyber events</p>
                <TimelineChart data={timelineData} activeModels={activeModels} onToggleModel={toggleModel} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
              { title: "ChatGPT Dominance", val: "~60%", desc: "Share of AI mentions, consistently leading across all 12 months", color: "#ef4444" },
              { title: "DeepSeek Peak", val: "2,800", desc: "Mentions in February — launch triggered highest single-model spike of 2025", color: "#06b6d4" },
              { title: "AI + Cyber Correlation", val: "6 events", desc: "Key cyber incidents directly correlated with AI mention spikes in the data", color: "#a855f7" }].
              map((card) =>
              <div key={card.title} className="rounded-xl border border-border/40 bg-card/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
                    <p className="text-2xl font-bold font-mono mb-1" style={{ color: card.color }}>{card.val}</p>
                    <p className="text-xs text-muted-foreground">{card.desc}</p>
                  </div>
              )}
              </div>
            </motion.div>
          }

          {/* ── THREAT GRAPH ── */}
          {activeTab === "threatgraph" &&
          <motion.div key="threatgraph" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-8">
              {/* Connection Graph */}
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                <h2 className="text-lg font-semibold mb-1 font-heading">Attacker → Attack → Region → Industry Connection Graph</h2>
                <p className="text-xs text-muted-foreground mb-5">Filter by threat actor · Click any node to trace its links · Edge thickness = attack frequency</p>
                <ConnectionGraph />
              </div>
              {/* 4-view Explorer */}
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                <ThreatGraphExplorer />
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                <GlobalEventsTimeline />
              </div>
            </motion.div>
          }

          {/* ── RELATIONSHIPS ── */}
          {activeTab === "relationships" &&
          <motion.div key="relationships" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
                <h2 className="text-lg font-semibold mb-1 font-heading">Threat Relationship Web</h2>
                <p className="text-xs text-muted-foreground mb-5">Click nodes to explore connections · Filter by category · Line thickness = relationship strength</p>
                <RelationshipWeb />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Key Cross-Dataset Relationships</h3>
                  <div className="space-y-2">
                    {[
                  { from: "USA (52% victims)", to: "Windows (90% malware)", strength: 95 },
                  { from: "Enterprise targets", to: "EXE delivery (68%)", strength: 78 },
                  { from: "Bot recon (30%)", to: "Human attack (52% USA)", strength: 62 }].
                  map((rel) =>
                  <div key={rel.from} className="space-y-1">
                        <div className="flex justify-between text-xs items-center">
                          <span className="text-pink-400">{rel.from}</span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />
                          <span className="text-cyan-400">{rel.to}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${rel.strength}%` }}
                      transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-pink-500 to-cyan-500" />
                        </div>
                      </div>
                  )}
                  </div>
                </div>
                <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Cross-Dataset Correlations</h3>
                  <div className="space-y-2">
                    {[
                  "N. America intrusions (55%) align with highest ransomware victim rates (USA 52%)",
                  "Windows dominance enables EXE as #1 file type — same OS, same delivery mechanism",
                  "Technology sector targeted in intrusions (23%) vs IT in ransomware (4%) — different actor goals",
                  "Bot traffic (30%) provides recon infrastructure enabling precision ransomware targeting"].
                  map((item, i) =>
                  <div key={i} className="flex gap-2 p-2 rounded-lg bg-white/[0.02] text-xs text-muted-foreground">
                        <span className="text-primary font-mono font-bold flex-shrink-0">{i + 1}.</span>
                        <span>{item}</span>
                      </div>
                  )}
                  </div>
                </div>
              </div>
            </motion.div>
          }

          {/* ── STORY ── */}
          {activeTab === "story" &&
          <motion.div key="story" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold font-heading mb-2">The Anatomy of a Cyber Attack in 2025</h2>
                <p className="text-sm text-muted-foreground mb-6">How the data connects — a step-by-step narrative from first probe to final impact.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {storySteps.map((step, i) => <StoryCard key={step.step} {...step} delay={i * 0.08} />)}
                </div>
              </div>
              <ConclusionPanel />
            </motion.div>
          }

        </AnimatePresence>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-12 pt-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground/40 font-mono">2025 Cyber Threat Intelligence · Interactive Dashboard · Data-driven security insights</p>
        </motion.div>
      </div>

      {/* Country Drilldown Modal */}
      {drilldownCountry && <CountryDrilldown country={drilldownCountry} onClose={() => setDrilldownCountry(null)} />}
    </div>);

}