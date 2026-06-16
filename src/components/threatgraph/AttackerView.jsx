import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Shield } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell,
} from "recharts";
import { attackerGroups, enrichIncidentsForCountry } from "../../lib/relationshipData";
import { YearRangeFilter } from "./ConnectionGraph";
import { attackColors, severityColors } from "../../lib/cyberData";

const TYPE_ORDER  = ["Nation-State","RaaS Group","Cybercrime"];
const TYPE_COLORS = { "Nation-State":"#ef4444","RaaS Group":"#ec4899","Cybercrime":"#f59e0b" };
const SECTORS = ["Technology","Healthcare","Finance","Government","Energy","Retail","Education","Defence","Telecom","Media","Transport"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"hsl(225,25%,9%)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:10, padding:"8px 12px", fontSize:11 }}>
      <p style={{ color:"#7a96b5", marginBottom:4 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ color:p.color, fontWeight:600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

function ActorRadar({ group, incidents }) {
  const data = SECTORS.map(s => ({
    sector: s.slice(0,6),
    count: incidents.filter(i => i.sector === s).length,
  })).filter(d => d.count > 0);
  if (data.length < 3) return (
    <div style={{ textAlign:"center", padding:"32px 0", color:"#3d556e", fontSize:12 }}>
      Not enough sector data for radar
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top:10, right:20, bottom:10, left:20 }}>
        <PolarGrid stroke="rgba(255,255,255,0.06)" />
        <PolarAngleAxis dataKey="sector" tick={{ fill:"#7a96b5", fontSize:10 }} />
        <Radar name="Incidents" dataKey="count" stroke={group.color}
          fill={group.color} fillOpacity={0.18} strokeWidth={1.5} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function ActorTimeline({ group, incidents }) {
  const years = Array.from({ length: 25 }, (_, i) => 2001 + i);
  const data = years.map(y => ({
    year: y,
    count: incidents.filter(i => i.year === y).length,
  })).filter(d => d.count > 0);
  if (data.length < 2) return (
    <div style={{ textAlign:"center", padding:"16px 0", color:"#3d556e", fontSize:11 }}>
      Insufficient timeline data
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data} margin={{ top:4, right:4, bottom:4, left:0 }}>
        <XAxis dataKey="year" tick={{ fill:"#3d556e", fontSize:9 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Bar dataKey="count" radius={[3,3,0,0]}>
          {data.map((_, i) => <Cell key={i} fill={group.color} fillOpacity={0.7 + i/data.length*0.3} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function AttackBreakdownBars({ incidents, color }) {
  const freq = {};
  incidents.forEach(i => { freq[i.attack] = (freq[i.attack]||0)+1; });
  const data = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,6)
    .map(([atk,v]) => ({ atk, v, color: attackColors[atk]||"#6b7280" }));
  const max = data[0]?.v || 1;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {data.map((d,i) => (
        <motion.div key={d.atk} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
          transition={{ delay:i*.05 }} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:10, minWidth:80, color:"#7a96b5" }}>{d.atk}</span>
          <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.04)", borderRadius:4, overflow:"hidden" }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${(d.v/max)*100}%` }}
              transition={{ duration:.8, delay:.3+i*.05 }}
              style={{ height:"100%", borderRadius:4, background:d.color }} />
          </div>
          <span style={{ fontSize:10, fontFamily:"monospace", color:d.color, minWidth:16 }}>{d.v}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function AttackerView({ country = "US" }) {
  const [selected, setSelected] = useState(null);
  const [yearFrom, setYearFrom] = useState(2001);
  const [yearTo,   setYearTo]   = useState(2025);
  const [filterType, setFilterType] = useState("All");
  const incidents = enrichIncidentsForCountry(country).filter(i => i.year >= yearFrom && i.year <= yearTo);

  const grouped = TYPE_ORDER.map(type => ({
    type, color: TYPE_COLORS[type],
    groups: attackerGroups.filter(g => g.type === type),
  }));
  const filtered = filterType === "All" ? grouped : grouped.filter(g => g.type === filterType);
  const selGroup = attackerGroups.find(g => g.id === selected);
  const selIncs  = selected ? incidents.filter(i => i.attacker === selected) : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    <YearRangeFilter yearFrom={yearFrom} yearTo={yearTo} setYearFrom={setYearFrom} setYearTo={setYearTo} />
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      {/* Left */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {/* Type filter */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {["All",...TYPE_ORDER].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{
                padding:"4px 12px", borderRadius:10, fontSize:11, fontWeight:500,
                cursor:"pointer", border:`1px solid ${filterType===t ? "rgba(236,72,153,.5)" : "rgba(255,255,255,.1)"}`,
                background: filterType===t ? "rgba(236,72,153,.1)" : "transparent",
                color: filterType===t ? "#ec4899" : "#7a96b5",
              }}>{t}</button>
          ))}
        </div>
        {/* Actor list */}
        <div style={{ display:"flex", flexDirection:"column", gap:14, overflowY:"auto",
          maxHeight:480, scrollbarWidth:"thin", scrollbarColor:"#1e2538 transparent" }}>
          {filtered.map(({ type, color, groups }) => (
            <div key={type}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:color }}/>
                <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase",
                  letterSpacing:"1.5px", color }}>{type}</span>
                <div style={{ flex:1, height:1, background:`${color}20` }}/>
              </div>
              {groups.map(g => {
                const incs = incidents.filter(i => i.attacker === g.id);
                const isSel = selected === g.id;
                return (
                  <motion.button key={g.id} onClick={() => setSelected(isSel ? null : g.id)}
                    whileHover={{ x:4 }} transition={{ duration:.15 }}
                    style={{
                      width:"100%", textAlign:"left", marginBottom:6,
                      padding:10, borderRadius:12, cursor:"pointer",
                      border:`1px solid ${isSel ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.06)"}`,
                      background: isSel ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.02)",
                    }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:11, fontWeight:800, fontFamily:"monospace",
                        background:`${g.color}18`, border:`1px solid ${g.color}30`, color:g.color }}>
                        {g.label.slice(0,3).toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:12, fontWeight:600, color:"#dce8f5" }}>{g.label}</span>
                          {incs.length > 0 &&
                            <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4,
                              fontFamily:"monospace", fontWeight:700,
                              background:`${g.color}18`, color:g.color }}>{incs.length}</span>}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                          <Globe size={10} style={{ color:"#3d556e" }}/>
                          <span style={{ fontSize:10, color:"#5a7592" }}>{g.origin}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:7, paddingLeft:46 }}>
                      {g.attacks.map(atk => (
                        <span key={atk} style={{ fontSize:9, padding:"1px 7px", borderRadius:4,
                          background:`${attackColors[atk]||"#6b7280"}14`,
                          color:attackColors[atk]||"#6b7280" }}>{atk}</span>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Right — rich visualizations */}
      <div style={{ borderRadius:16, border:"1px solid rgba(255,255,255,.07)",
        background:"rgba(17,20,32,.8)", padding:18, minHeight:400, display:"flex",
        flexDirection:"column" }}>
        <AnimatePresence mode="wait">
          {selGroup ? (
            <motion.div key={selGroup.id} initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ flex:1, display:"flex", flexDirection:"column", gap:14 }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", gap:12,
                paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, fontWeight:800, fontFamily:"monospace",
                  background:`${selGroup.color}18`, border:`1px solid ${selGroup.color}30`,
                  color:selGroup.color }}>
                  {selGroup.label.slice(0,3).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#dce8f5" }}>{selGroup.label}</div>
                  <div style={{ display:"flex", gap:8, marginTop:3 }}>
                    <span style={{ fontSize:10, color:"#5a7592" }}>{selGroup.origin}</span>
                    <span style={{ fontSize:9, padding:"1px 7px", borderRadius:4,
                      background:`${TYPE_COLORS[selGroup.type]||"#6b7280"}18`,
                      color:TYPE_COLORS[selGroup.type]||"#6b7280" }}>{selGroup.type}</span>
                  </div>
                </div>
              </div>
              {/* Mini stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {[
                  { l:"Incidents",    v:selIncs.length },
                  { l:"Attack Types", v:[...new Set(selIncs.map(i=>i.attack))].length },
                  { l:"Sectors Hit",  v:[...new Set(selIncs.map(i=>i.sector))].length },
                ].map(s => (
                  <div key={s.l} style={{ borderRadius:10, border:"1px solid rgba(255,255,255,.06)",
                    padding:"8px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:800, fontFamily:"monospace",
                      color:selGroup.color }}>{s.v}</div>
                    <div style={{ fontSize:9, color:"#5a7592", marginTop:2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Sector radar */}
              {selIncs.length >= 3 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
                    textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
                    Sector Targeting Radar
                  </div>
                  <ActorRadar group={selGroup} incidents={selIncs}/>
                </div>
              )}
              {/* Attack breakdown */}
              {selIncs.length > 0 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
                    textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>
                    Attack Type Breakdown
                  </div>
                  <AttackBreakdownBars incidents={selIncs} color={selGroup.color}/>
                </div>
              )}
              {/* Activity timeline */}
              {selIncs.length >= 2 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
                    textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>
                    Activity Timeline
                  </div>
                  <ActorTimeline group={selGroup} incidents={selIncs}/>
                </div>
              )}
              {selIncs.length === 0 && (
                <div style={{ flex:1, display:"flex", alignItems:"center",
                  justifyContent:"center", color:"#3d556e", fontSize:12 }}>
                  No incidents directly attributed in dataset
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", textAlign:"center", gap:10 }}>
              <Shield size={36} style={{ color:"rgba(255,255,255,.06)" }}/>
              <p style={{ fontSize:12, color:"#3d556e" }}>
                Select a threat actor<br/>to see their visualizations
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
}