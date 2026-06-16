import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import DonutChart from "../charts/DonutChart";
import { useGlobe } from "../../context/GlobeContext";
import { ATTACK_COLORS, SECTOR_COLORS } from "../../lib/colors";
import { usaCyberThreats } from "../../lib/cyberData";

const ALL_EVENTS = [
  { year:2001, event:"9/11 & Early Cyber Warfare", surge:"Gov/military network intrusions surge",
    icon:"💥", color:"#ef4444", attackTypes:["Malware","DDoS"], targets:["Government","Technology"],
    actors:["Unknown nation-state actors","Script kiddies"],
    incidents:[2,1],
    detail:"Code Red and Nimda worms spread globally. Nation-state interest in cyber capabilities accelerates after 9/11." },
  { year:2003, event:"SQL Slammer / Blaster Worms", surge:"Internet-wide outages from worm propagation",
    icon:"🐛", color:"#f97316", attackTypes:["Malware","DDoS"], targets:["Technology","Finance"],
    actors:["Unknown criminal actors"],
    incidents:[8,7],
    detail:"SQL Slammer infects 75,000 hosts in 10 minutes. Blaster worm causes widespread Windows XP outages." },
  { year:2007, event:"Estonia Cyberattacks", surge:"First nation-state DDoS campaign on critical infra",
    icon:"🌐", color:"#eab308", attackTypes:["DDoS","APT"], targets:["Government","Media"],
    actors:["Russia-linked actors","Patriotic hackers"],
    incidents:[19],
    detail:"Russia-linked DDoS attacks knock Estonian banks, media, and government sites offline for weeks." },
  { year:2009, event:"Operation Aurora", surge:"State-sponsored espionage against US tech firms",
    icon:"🎯", color:"#a855f7", attackTypes:["APT","Zero-Day"], targets:["Technology","Defence"],
    actors:["APT41 / China-linked","Comment Crew"],
    incidents:[25],
    detail:"China-linked APT exploits IE zero-day. Google, Adobe, and 30+ firms targeted in coordinated espionage campaign." },
  { year:2010, event:"Stuxnet Discovered", surge:"First industrial-control cyber weapon deployed",
    icon:"⚙️", color:"#06b6d4", attackTypes:["Zero-Day","Wiper"], targets:["Energy","Government"],
    actors:["Equation Group (US/NSA)","Unit 8200 (Israel)"],
    incidents:[30],
    detail:"Stuxnet — attributed to US/Israel — destroys ~1,000 Iranian nuclear centrifuges. Establishes cyber as a warfare domain." },
  { year:2011, event:"RSA & Sony PSN Breaches", surge:"Spear phishing and credential theft at scale",
    icon:"🔐", color:"#ec4899", attackTypes:["Phishing","Data Breach"], targets:["Defence","Media"],
    actors:["APT29 / Cozy Bear","China-linked APT"],
    incidents:[32,31],
    detail:"RSA token compromise affects downstream defense. Sony PSN breach exposes 77M accounts. Phishing becomes the #1 vector." },
  { year:2013, event:"Snowden Revelations + Target POS", surge:"Mass surveillance disclosed; retail POS attacks surge",
    icon:"👁️", color:"#8b5cf6", attackTypes:["APT","Data Breach"], targets:["Government","Retail"],
    actors:["NSA / Five Eyes","Eastern European cybercriminals"],
    incidents:[37,38],
    detail:"Snowden leaks NSA mass surveillance. Target POS breach steals 40M cards via HVAC vendor supply-chain access." },
  { year:2014, event:"Sony Pictures Wiper + iCloud Leaks", surge:"Destructive attacks and cloud credential theft",
    icon:"💣", color:"#ef4444", attackTypes:["Wiper","Credential"], targets:["Media","Technology"],
    actors:["Lazarus Group (North Korea)","Unknown cybercriminals"],
    incidents:[40],
    detail:"North Korea-linked Lazarus Group destroys 70% of Sony's IT estate. Celebrity iCloud credentials harvested via phishing." },
  { year:2015, event:"OPM Breach + Anthem", surge:"Largest US government data theft in history",
    icon:"🏛️", color:"#f97316", attackTypes:["APT","Data Breach"], targets:["Government","Healthcare"],
    actors:["APT41 (China)","Deep Panda"],
    incidents:[43,45],
    detail:"China-linked APT steals 21.5M US personnel and clearance files from OPM. Anthem exposes 78.8M patient records." },
  { year:2016, event:"US Election Interference + Mirai IoT Botnet", surge:"State-sponsored influence ops; IoT weaponised",
    icon:"🗳️", color:"#ec4899", attackTypes:["APT","DDoS","Phishing"], targets:["Government","Technology"],
    actors:["Russian APT groups","Cozy Bear / Fancy Bear"],
    incidents:[47,48],
    detail:"Cozy Bear/Fancy Bear hack DNC emails. Mirai botnet (600Gbps) knocks Twitter, Netflix, Spotify offline via Dyn DNS." },
  { year:2017, event:"WannaCry & NotPetya Outbreaks", surge:"Global ransomware / wiper pandemic",
    icon:"💀", color:"#ef4444", attackTypes:["Ransomware","Wiper","Malware"], targets:["Healthcare","Technology","Transport"],
    actors:["Lazarus Group (North Korea)","Sandworm (Russia)"],
    incidents:[50,51,49],
    detail:"WannaCry hits 230K systems across 150 countries including NHS. NotPetya causes $10B+ global damage. EternalBlue weaponised." },
  { year:2018, event:"SamSam Ransomware + GDPR Era", surge:"Ransomware targets municipalities and hospitals",
    icon:"🏙️", color:"#f59e0b", attackTypes:["Ransomware","Data Breach"], targets:["Government","Healthcare","Finance"],
    actors:["SamSam operators (Iran-linked)","FIN7"],
    incidents:[52,53,54],
    detail:"Atlanta and other cities hit by SamSam ransomware. GDPR enforcement begins. Marriott breach exposes 383M records." },
  { year:2019, event:"RaaS Boom + Capital One Cloud Breach", surge:"Ransomware-as-a-Service democratises attacks",
    icon:"💰", color:"#ec4899", attackTypes:["Ransomware","Data Breach","Credential"], targets:["Government","Finance"],
    actors:["REvil / GandCrab","Cybercriminal groups"],
    incidents:[55,56,57],
    detail:"REvil, GandCrab, Ryuk RaaS operations scale. Capital One cloud misconfiguration exposes 106M records via SSRF." },
  { year:2020, event:"COVID-19 + SolarWinds Supply Chain", surge:"Pandemic-driven phishing surge; nation-state supply chain",
    icon:"🦠", color:"#06b6d4", attackTypes:["Supply Chain","APT","Phishing","Ransomware"], targets:["Government","Healthcare","Technology"],
    actors:["APT29 / Cozy Bear (Russia)","Multiple cybercrime groups"],
    incidents:[60,58],
    detail:"COVID phishing campaigns triple. SolarWinds Orion trojanised update compromises 18,000 organisations including 9 US agencies." },
  { year:2021, event:"Colonial Pipeline + Kaseya + Exchange", surge:"Critical infrastructure ransomware & supply chain attacks",
    icon:"⚡", color:"#fbbf24", attackTypes:["Ransomware","Supply Chain","Zero-Day"], targets:["Energy","Technology","Government"],
    actors:["DarkSide / ALPHV","REvil","Hafnium (China)"],
    incidents:[64,62,65],
    detail:"Colonial Pipeline halts US East Coast fuel 6 days. Kaseya VSA hits 1,500 MSP customers. ProxyLogon exploited at mass scale." },
  { year:2022, event:"Russia-Ukraine Cyber War", surge:"Wiper malware, hacktivism, and telecom attacks escalate",
    icon:"⚔️", color:"#ef4444", attackTypes:["Wiper","DDoS","Ransomware","Data Breach"], targets:["Government","Energy","Telecom"],
    actors:["Sandworm (Russia)","LAPSUS$","Killnet"],
    incidents:[67,66,69],
    detail:"HermeticWiper, AcidRain, WhisperGate deployed against Ukraine. LAPSUS$ hits Okta, Samsung, Nvidia. LAUSD ransomware." },
  { year:2023, event:"MOVEit Mass Exploit + MGM / Caesars", surge:"Third-party supply chain and social engineering at scale",
    icon:"🔗", color:"#a855f7", attackTypes:["Supply Chain","Ransomware","Phishing"], targets:["Technology","Retail","Finance"],
    actors:["Cl0p (Russia)","Scattered Spider"],
    incidents:[71,72,73],
    detail:"Cl0p exploits MOVEit zero-day hitting 1,000+ orgs. Scattered Spider socially engineers MGM ($100M) and Caesars ($30M)." },
  { year:2024, event:"Salt Typhoon + Change Healthcare", surge:"Telecom espionage; healthcare billing collapse",
    icon:"🌊", color:"#06b6d4", attackTypes:["APT","Ransomware","Data Breach"], targets:["Telecom","Healthcare","Retail"],
    actors:["Salt Typhoon (China)","ALPHV / BlackCat"],
    incidents:[74,78,75],
    detail:"Salt Typhoon (China) breaches US telecoms — wiretap access. Change Healthcare ransomware causes $22B billing disruption." },
  { year:2025, event:"AI-Powered Attacks + RaaS Escalation", surge:"LLM-generated phishing; critical sector ransomware peaks",
    icon:"🤖", color:"#ec4899", attackTypes:["Phishing","Ransomware","APT"], targets:["Finance","Energy","Healthcare"],
    actors:["Medusa / RansomHub","AI-augmented criminal groups"],
    incidents:[80,81,83,85],
    detail:"AI-generated phishing campaigns achieve record click rates. Medusa/RansomHub target power, water, and gas infrastructure." },
];

// ── Donut builders ────────────────────────────────────────────────────────────
function buildSectorDonut(activeSectors, yearS, yearE) {
  const counts = {};
  usaCyberThreats.filter(d => d.year>=yearS && d.year<=yearE && activeSectors.has(d.sector))
    .forEach(d => { counts[d.sector]=(counts[d.sector]||0)+1; });
  const total = Object.values(counts).reduce((s,v)=>s+v,0)||1;
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,10)
    .map(([label,v]) => ({ label, value:Math.round(v/total*100), color:SECTOR_COLORS[label]||"#60a5fa" }));
}

function buildAttackDonut(activeAttacks, yearS, yearE) {
  const counts = {};
  usaCyberThreats.filter(d => d.year>=yearS && d.year<=yearE && activeAttacks.has(d.attack))
    .forEach(d => { counts[d.attack]=(counts[d.attack]||0)+1; });
  const total = Object.values(counts).reduce((s,v)=>s+v,0)||1;
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])
    .map(([label,v]) => ({ label, value:Math.round(v/total*100), color:ATTACK_COLORS[label]||"#60a5fa" }));
}

const REGION_DONUT = [
  {label:"North America",value:55,color:"#ef4444"},
  {label:"Europe",       value:9, color:"#f97316"},
  {label:"South Asia",   value:9, color:"#a855f7"},
  {label:"SE Asia",      value:7, color:"#0f766e"},
  {label:"East Asia",    value:5, color:"#06b6d4"},
  {label:"South America",value:6, color:"#10b981"},
  {label:"Middle East",  value:4, color:"#f59e0b"},
  {label:"Africa",       value:2, color:"#0d9488"},
  {label:"Oceania",      value:2, color:"#0891b2"},
  {label:"C. America",   value:1, color:"#164e63"},
];

// ── Vertical timeline panel ───────────────────────────────────────────────────
function TimelinePanel({ currentYear }) {
  const bodyRef = useRef(null);
  const [expandedYear, setExpandedYear] = useState(null);
  const { yearRange } = useGlobe();
  const [yearS] = yearRange;

  // Show all events from yearS up to currentYear (the right handle)
  const visible = ALL_EVENTS.filter(e => e.year >= yearS && e.year <= currentYear);

  // Auto-scroll to bottom when new events appear
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [visible.length]);

  // Get linked incidents from dataset for an event
  function getLinkedIncidents(ev) {
    if (!ev.incidents || ev.incidents.length === 0) return [];
    return usaCyberThreats.filter(i => ev.incidents.includes(i.id));
  }

  const ROW_COLORS = ["#ec4899","#a855f7","#06b6d4","#f97316","#ef4444","#10b981","#eab308","#8b5cf6","#f43f5e","#0ea5e9","#84cc16","#fb923c","#38bdf8","#e879f9","#34d399","#fbbf24","#f472b6","#60a5fa","#4ade80","#c084fc"];

  return (
    <div className="flex flex-col h-full">
      {/* Mini header */}
      <div style={{ padding:"10px 14px 8px", borderBottom:"1px solid #1e2538", flexShrink:0 }}>
        <div style={{ fontSize:11, fontWeight:600, color:"#dce8f5" }}>Cyber Events Timeline</div>
        <div style={{ fontSize: 9.5, color: "#3d556e", marginTop: 2 }}>
          {visible.length} event{visible.length !== 1 ? "s" : ""} ·{" "}
          <span style={{ color: "#ec4899", fontFamily: "monospace", fontWeight: 700 }}>{yearS}</span>
          {" → "}
          <span style={{ color: "#a855f7", fontFamily: "monospace", fontWeight: 700 }}>{currentYear}</span>
        </div>
      </div>

      {/* Scrollable events */}
      <div ref={bodyRef} style={{ flex:1, overflowY:"auto", padding:"10px 0",
        scrollbarWidth:"thin", scrollbarColor:"#1e2538 transparent" }}>

        {visible.length === 0 && (
          <div style={{ textAlign:"center", padding:"32px 16px", fontSize:11, color:"#3d556e" }}>
            Drag the slider to explore cyber events...
          </div>
        )}

        {visible.length > 0 && (
          <div style={{ position:"relative", paddingLeft:52, paddingRight:10 }}>
            {/* Timeline vertical line */}
            <div style={{
              position:"absolute", left:26, top:0, bottom:0, width:2,
              background:"linear-gradient(to bottom,#1e2538,#263048,#1e2538)",
              borderRadius:2,
            }}/>

            <AnimatePresence initial={false}>
              {visible.map((ev, i) => {
                const col = ROW_COLORS[i % ROW_COLORS.length];
                const isNew = i === visible.length - 1;
                const isExpanded = expandedYear === ev.year + ev.event;
                const linked = getLinkedIncidents(ev);
                return (
                  <motion.div
                    key={ev.year + ev.event}
                    initial={{ opacity:0, x:30, scale:0.96 }}
                    animate={{ opacity:1, x:0, scale:1 }}
                    transition={{ duration:0.42, ease:[0.25,0.46,0.45,0.94] }}
                    style={{ position:"relative", marginBottom:14 }}
                  >
                    {/* Year badge on spine */}
                    <div style={{
                      position:"absolute", left:-52, top:4,
                      width:40, height:22, borderRadius:5,
                      background:col,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:9, fontWeight:800, fontFamily:"monospace",
                      color:"#fff", letterSpacing:"0.5px",
                      boxShadow: isNew ? `0 0 12px ${col}66` : "none",
                    }}>
                      {ev.year}
                    </div>

                    {/* Connector dot on spine */}
                    <div style={{
                      position:"absolute", left:-30, top:8,
                      width:8, height:8, borderRadius:"50%",
                      background:col, border:"2px solid #0d0f17",
                      boxShadow: isNew ? `0 0 8px ${col}` : "none",
                    }}/>

                    {/* Card */}
                    <div
                      style={{
                        background:`${col}09`, border:`1px solid ${col}28`,
                        borderRadius:10, borderLeft:`3px solid ${col}`,
                        cursor:"pointer", overflow:"hidden",
                      }}
                      onClick={() => setExpandedYear(isExpanded ? null : ev.year + ev.event)}
                    >
                      {/* Card header — always visible */}
                      <div style={{ padding:"9px 10px 7px" }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:4 }}>
                          <span style={{ fontSize:14, lineHeight:1, flexShrink:0 }}>{ev.icon}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:4 }}>
                              <div style={{ fontSize:10.5, fontWeight:700, color:"#dce8f5", lineHeight:1.3 }}>{ev.event}</div>
                              <span style={{ fontSize:9, color: isExpanded ? col : "#3d556e", transition:"color .2s", flexShrink:0 }}>
                                {isExpanded ? "▲" : "▼"}
                              </span>
                            </div>
                            <div style={{ fontSize:9, color:col, fontWeight:500, marginTop:1 }}>{ev.surge}</div>
                          </div>
                        </div>

                        {/* Attack type pills */}
                        <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                          {ev.attackTypes.map(at => (
                            <span key={at} style={{
                              fontSize:7.5, padding:"1px 5px", borderRadius:4,
                              background:`${ATTACK_COLORS[at]||"#6b7280"}22`,
                              color:ATTACK_COLORS[at]||"#6b7280", fontWeight:700,
                              border:`1px solid ${ATTACK_COLORS[at]||"#6b7280"}40`,
                            }}>{at}</span>
                          ))}
                        </div>
                      </div>

                      {/* Expanded detail — matches screenshot layout */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            key="detail"
                            initial={{ height:0, opacity:0 }}
                            animate={{ height:"auto", opacity:1 }}
                            exit={{ height:0, opacity:0 }}
                            transition={{ duration:0.28, ease:"easeInOut" }}
                            style={{ overflow:"hidden" }}
                          >
                            <div style={{ borderTop:`1px solid ${col}20`, padding:"8px 10px 10px" }}>
                              {/* 3-box row: Targets / Threat Actors / Attack Surge */}
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5, marginBottom:8 }}>
                                {[
                                  { icon:"🎯", label:"TARGETS", val: ev.targets?.join(", ") || "—" },
                                  { icon:"👥", label:"THREAT ACTORS", val: ev.actors?.join(", ") || "—" },
                                  { icon:"📈", label:"ATTACK SURGE", val: ev.surge || "—" },
                                ].map(box => (
                                  <div key={box.label} style={{
                                    background:"rgba(255,255,255,0.04)",
                                    border:"1px solid rgba(255,255,255,0.07)",
                                    borderRadius:7, padding:"5px 7px",
                                  }}>
                                    <div style={{ fontSize:7, fontWeight:700, color:col, letterSpacing:"0.8px", marginBottom:3, display:"flex", alignItems:"center", gap:3 }}>
                                      <span>{box.icon}</span>{box.label}
                                    </div>
                                    <div style={{ fontSize:8.5, color:"#c8d8e8", lineHeight:1.35 }}>{box.val}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Detail text */}
                              {ev.detail && (
                                <div style={{ fontSize:9, color:"#5a7592", lineHeight:1.5, marginBottom:linked.length>0?7:0 }}>
                                  {ev.detail}
                                </div>
                              )}

                              {/* Linked incidents from dataset */}
                              {linked.length > 0 && (
                                <div>
                                  <div style={{
                                    fontSize:7.5, fontWeight:700, color:"#3d556e",
                                    letterSpacing:"0.8px", marginBottom:5,
                                    display:"flex", alignItems:"center", gap:4,
                                  }}>
                                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#3d556e", display:"inline-block" }}/>
                                    LINKED INCIDENTS FROM DATASET
                                  </div>
                                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                                    {linked.map(inc => (
                                      <div key={inc.id} style={{
                                        background:"rgba(255,255,255,0.03)",
                                        border:"1px solid rgba(255,255,255,0.06)",
                                        borderRadius:6, padding:"5px 7px",
                                      }}>
                                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:3, marginBottom:3 }}>
                                          <div style={{ width:6, height:6, borderRadius:"50%", flexShrink:0,
                                            background:ATTACK_COLORS[inc.attack]||"#6b7280" }}/>
                                          <span style={{ fontSize:9, fontWeight:600, color:"#c8d8e8", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                            {inc.threat.length > 22 ? inc.threat.slice(0,22)+"…" : inc.threat}
                                          </span>
                                          <span style={{ fontSize:8, color:"#3d556e", fontFamily:"monospace", flexShrink:0 }}>{inc.year}</span>
                                        </div>
                                        <div style={{ display:"flex", gap:3 }}>
                                          <span style={{
                                            fontSize:7, padding:"1px 4px", borderRadius:3,
                                            background:`${ATTACK_COLORS[inc.attack]||"#6b7280"}22`,
                                            color:ATTACK_COLORS[inc.attack]||"#6b7280", fontWeight:600,
                                          }}>{inc.attack}</span>
                                          <span style={{
                                            fontSize:7, padding:"1px 4px", borderRadius:3,
                                            background:"rgba(255,255,255,0.06)", color:"#7a96b5",
                                          }}>{inc.sector}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel heading ─────────────────────────────────────────────────────────────
const HEADINGS = {
  sectors:  { title:"Top Industries Targeted",    sub:"Sectors filter active · hover segments" },
  attacks:  { title:"Attack Types Distribution",  sub:"Click an arc on globe to show globally" },
  regions:  { title:"Intrusions by Region",       sub:"Interactive attack distribution · 2025" },
  timeline: { title:"Cyber Events Timeline",      sub:"Builds as you slide through years" },
};
const ACCENT_COLORS = { sectors:"#fbbf24", attacks:"#ef4444", regions:"#34d399", timeline:"#ec4899" };

// ── Main RightPanel ───────────────────────────────────────────────────────────
export default function RightPanel() {
  const {
    rightPanel, closeRightPanel, activePanelSource,
    activeSectors, activeAttacks,
    yearRange, selectedYear,
  } = useGlobe();
  const [yearS, yearE] = yearRange;
  const isOpen = rightPanel !== null;

  const heading = HEADINGS[rightPanel] || { title:"Info", sub:"" };
  const accentKey = rightPanel;
  const dynamicTitle = activePanelSource?.key
    ? `${heading.title.split(" ")[0]} · ${activePanelSource.key}`
    : heading.title;

  const sectorData = rightPanel==="sectors" ? buildSectorDonut(activeSectors, yearS, yearE) : [];
  const attackData = rightPanel==="attacks" ? buildAttackDonut(activeAttacks, yearS, yearE) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x:"100%", opacity:0 }}
          animate={{ x:0, opacity:1 }}
          exit={{ x:"100%", opacity:0 }}
          transition={{ type:"spring", stiffness:340, damping:38 }}
          style={{
            position:"absolute", right:0, top:0, bottom:52,
            width:300, display:"flex", flexDirection:"column",
            background:"rgba(11,14,24,0.97)",
            backdropFilter:"blur(16px)",
            borderLeft:"1px solid #1e2538",
            zIndex:50,
          }}
        >
          {/* Accent left bar */}
          <div style={{
            position:"absolute", left:0, top:0, width:2, height:"100%",
            background:`linear-gradient(to bottom,${ACCENT_COLORS[accentKey]||"#ec4899"},transparent)`,
            opacity:0.7,
          }}/>

          {/* Header */}
          <div style={{ padding:"12px 14px 10px", borderBottom:"1px solid #1e2538",
            display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0 }}>
            <div>
              <motion.div key={rightPanel+(activePanelSource?.key||"")}
                initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                style={{ fontSize:12, fontWeight:700, color:"#dce8f5" }}>
                {dynamicTitle}
              </motion.div>
              <div style={{ fontSize:9.5, color:"#3d556e", marginTop:2 }}>
                {(rightPanel === "sectors" || rightPanel === "attacks" || rightPanel === "regions")
                  ? `Data: ${yearS}–${yearE}`
                  : heading.sub}
              </div>
            </div>
            <button onClick={closeRightPanel}
              style={{ padding:5, borderRadius:6, background:"rgba(255,255,255,0.05)",
                border:"none", cursor:"pointer", color:"#7a96b5", display:"flex",
                alignItems:"center", justifyContent:"center" }}>
              <X size={12}/>
            </button>
          </div>

          {/* Body */}
          <div style={{ flex:1, overflow:"hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div key={rightPanel}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}
                style={{ height:"100%" }}>

                {rightPanel==="timeline" && <TimelinePanel currentYear={yearE}/>}

                {rightPanel==="sectors" && (
                  <div className="overflow-y-auto h-full px-4 py-4" style={{ scrollbarWidth:"thin" }}>
                    {sectorData.length > 0 ? (
                      <DonutChart
                        data={sectorData}
                        title="Top Industries Targeted"
                        subtitle={`${yearS}–${yearE} · hover a segment to explore`}
                        size={200}
                      />
                    ) : (
                      <div className="text-center py-10 text-xs text-muted-foreground">
                        Enable sectors in filters to see data
                      </div>
                    )}
                  </div>
                )}

                {rightPanel==="attacks" && (
                  <div className="overflow-y-auto h-full px-4 py-4" style={{ scrollbarWidth:"thin" }}>
                    {attackData.length > 0 ? (
                      <DonutChart
                        data={attackData}
                        title="Attack Types Distribution"
                        subtitle={`${yearS}–${yearE} · click arc on globe to show globally`}
                        size={200}
                      />
                    ) : (
                      <div className="text-center py-10 text-xs text-muted-foreground">
                        Enable attack types in filters to see data
                      </div>
                    )}
                  </div>
                )}

                {rightPanel==="regions" && (
                  <div className="overflow-y-auto h-full px-4 py-4" style={{ scrollbarWidth:"thin" }}>
                    <DonutChart
                      data={REGION_DONUT}
                      title="Intrusions by Region"
                      subtitle="Interactive attacks · 2025 · hover to explore"
                      size={200}
                    />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
