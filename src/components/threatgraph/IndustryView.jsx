import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend,
} from "recharts";
import { enrichIncidentsForCountry, attackerGroups } from "../../lib/relationshipData";
import { YearRangeFilter } from "./ConnectionGraph";
import { attackColors, severityColors } from "../../lib/cyberData";

const SECTOR_COLORS = {
  Technology:"#06b6d4",Healthcare:"#10b981",Finance:"#f59e0b",Government:"#8b5cf6",
  Energy:"#f97316",Retail:"#ec4899",Education:"#84cc16",Defence:"#ef4444",
  Telecom:"#0ea5e9",Media:"#d946ef",Transport:"#fb923c",
};
const SEV_COLORS = { Critical:"#ef4444",High:"#f97316",Medium:"#eab308",Low:"#22c55e" };
const TOP_ATTACKS = ["Ransomware","Data Breach","APT","Phishing","Malware","Supply Chain","DDoS","Zero-Day","Credential","Wiper"];

const CTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"hsl(225,25%,9%)", border:"1px solid rgba(255,255,255,.1)",
      borderRadius:10, padding:"8px 12px", fontSize:11, maxWidth:200 }}>
      <p style={{ color:"#7a96b5", marginBottom:4 }}>{label}</p>
      {payload.filter(p=>p.value>0).map(p=>(
        <div key={p.dataKey} style={{ display:"flex", gap:6, alignItems:"center", marginBottom:2 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:p.fill||p.color, flexShrink:0 }}/>
          <span style={{ color:"#7a96b5" }}>{p.dataKey}:</span>
          <span style={{ fontWeight:700, color:p.fill||p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function StackedAttackChart({ incidents, color }) {
  // Build year × attackType stacked data
  const years = Array.from({length:25},(_,i)=>2001+i);
  const usedAttacks = [...new Set(incidents.map(i=>i.attack))];
  const data = years.map(y => {
    const row = { year:String(y) };
    usedAttacks.forEach(atk => {
      row[atk] = incidents.filter(i=>i.year===y && i.attack===atk).length;
    });
    return row;
  }).filter(row => usedAttacks.some(a=>row[a]>0));

  return (
    <div>
      <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
        textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>
        Attack Pattern Evolution
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top:5, right:5, bottom:5, left:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
          <XAxis dataKey="year" tick={{ fill:"#3d556e", fontSize:8 }}
            axisLine={false} tickLine={false} interval={3}/>
          <YAxis tick={{ fill:"#3d556e", fontSize:8 }} axisLine={false} tickLine={false} width={20}/>
          <Tooltip content={<CTooltip/>}/>
          {usedAttacks.map(atk => (
            <Area key={atk} type="monotone" dataKey={atk} stackId="1"
              stroke={attackColors[atk]||"#6b7280"} fill={attackColors[atk]||"#6b7280"}
              fillOpacity={0.6} strokeWidth={1}/>
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AttackerNetworkGraph({ incidents, color }) {
  // Mini attacker → sector node graph using SVG
  const actorFreq = {};
  incidents.forEach(i=>{
    if(i.attacker && i.attacker!=="unknown")
      actorFreq[i.attacker]=(actorFreq[i.attacker]||0)+1;
  });
  const topActors = Object.entries(actorFreq).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if (!topActors.length) return null;

  const W=260, H=120;
  const cx=W/2, cy=H/2, radius=42;

  return (
    <div>
      <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
        textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
        Threat Actor Involvement
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {topActors.map(([actor,v],i) => {
          const grp = attackerGroups.find(g=>g.id===actor);
          const gColor = grp?.color || color;
          return (
            <motion.div key={actor} initial={{ opacity:0, x:-16 }}
              animate={{ opacity:1, x:0 }} transition={{ delay:i*.06 }}
              style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:24, height:24, borderRadius:6, flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:8, fontWeight:800, fontFamily:"monospace",
                background:`${gColor}18`, border:`1px solid ${gColor}30`, color:gColor }}>
                {(grp?.label||actor).slice(0,3).toUpperCase()}
              </div>
              <span style={{ fontSize:10, color:"#7a96b5", flex:1,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {grp?.label || actor}
              </span>
              <div style={{ width:60, height:5, background:"rgba(255,255,255,.04)",
                borderRadius:3, overflow:"hidden" }}>
                <motion.div initial={{ width:0 }}
                  animate={{ width:`${(v/topActors[0][1])*100}%` }}
                  transition={{ duration:.7, delay:.3+i*.06 }}
                  style={{ height:"100%", borderRadius:3, background:gColor }}/>
              </div>
              <span style={{ fontSize:9, fontFamily:"monospace", color:gColor, minWidth:14 }}>{v}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SeverityBreakdown({ incidents }) {
  const sevs = ["Critical","High","Medium","Low"];
  const data = sevs.map(s => ({
    name:s, value:incidents.filter(i=>i.severity===s).length, color:SEV_COLORS[s],
  })).filter(d=>d.value>0);
  const max = Math.max(...data.map(d=>d.value),1);
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
        textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
        Severity Breakdown
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {data.map((d,i) => (
          <motion.div key={d.name} initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ delay:i*.05 }} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:9.5, fontWeight:600, color:d.color, minWidth:52 }}>{d.name}</span>
            <div style={{ flex:1, height:6, background:"rgba(255,255,255,.04)",
              borderRadius:3, overflow:"hidden" }}>
              <motion.div initial={{ width:0 }}
                animate={{ width:`${(d.value/max)*100}%` }}
                transition={{ duration:.7, delay:.2+i*.05 }}
                style={{ height:"100%", borderRadius:3, background:d.color }}/>
            </div>
            <span style={{ fontSize:9, fontFamily:"monospace", color:d.color, minWidth:14 }}>{d.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function IndustryView({ country="US" }) {
  const [selected, setSelected] = useState(null);
  const [yearFrom, setYearFrom] = useState(2001);
  const [yearTo,   setYearTo]   = useState(2025);
  const incidents = enrichIncidentsForCountry(country).filter(i => i.year >= yearFrom && i.year <= yearTo);
  const sectors = [...new Set(incidents.map(i=>i.sector))];
  const sectorData = sectors.map(sec => {
    const incs = incidents.filter(i=>i.sector===sec);
    const af={};
    incs.forEach(i=>{af[i.attack]=(af[i.attack]||0)+1;});
    return {
      sector:sec, color:SECTOR_COLORS[sec]||"#6b7280",
      incidents:incs.sort((a,b)=>a.year-b.year),
      count:incs.length, attackFreq:af,
      criticals:incs.filter(i=>i.severity==="Critical").length,
      yearSpan:`${Math.min(...incs.map(i=>i.year))}–${Math.max(...incs.map(i=>i.year))}`,
    };
  }).sort((a,b)=>b.count-a.count);

  const selSec = sectorData.find(s=>s.sector===selected);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <YearRangeFilter yearFrom={yearFrom} yearTo={yearTo} setYearFrom={setYearFrom} setYearTo={setYearTo} />
      {/* Sector card grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {sectorData.map((s,i) => (
          <motion.button key={s.sector}
            initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:i*.04 }}
            onClick={() => setSelected(selected===s.sector ? null : s.sector)}
            style={{ position:"relative", padding:12, borderRadius:12, textAlign:"left",
              cursor:"pointer", overflow:"hidden",
              border:`1px solid ${selected===s.sector ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.06)"}`,
              background:selected===s.sector ? `${s.color}10` : "rgba(255,255,255,.02)",
              transform:selected===s.sector ? "scale(1.02)" : "scale(1)",
              transition:"all .2s" }}>
            {/* Top accent */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
              background:s.color, borderRadius:"2px 2px 0 0" }}/>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", marginBottom:6 }}>
              <div style={{ width:28, height:28, borderRadius:7, flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:9, fontWeight:800, fontFamily:"monospace",
                background:`${s.color}18`, border:`1px solid ${s.color}30`, color:s.color }}>
                {s.sector.slice(0,3).toUpperCase()}
              </div>
              <span style={{ fontSize:16, fontWeight:800, fontFamily:"monospace",
                color:s.color }}>{s.count}</span>
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:"#dce8f5",
              marginBottom:2, lineHeight:1.2 }}>{s.sector}</div>
            <div style={{ fontSize:9, color:"#3d556e", marginBottom:6 }}>{s.yearSpan}</div>
            {/* Severity mini bar */}
            <div style={{ height:3, borderRadius:2,
              background:"rgba(255,255,255,.04)", overflow:"hidden" }}>
              <div style={{ width:`${(s.criticals/s.count)*100}%`, height:"100%",
                borderRadius:2, background:"#ef4444" }}/>
            </div>
            <div style={{ fontSize:8.5, color:"#3d556e", marginTop:3 }}>
              {s.criticals} critical
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selSec && (
          <motion.div key={selSec.sector}
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
            exit={{ opacity:0, height:0 }} transition={{ duration:.28 }}
            style={{ overflow:"hidden" }}>
            <div style={{ borderRadius:16, border:"1px solid rgba(255,255,255,.07)",
              background:"rgba(17,20,32,.8)", padding:20,
              display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* Left col */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", gap:10,
                  paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                  <div style={{ width:36, height:36, borderRadius:10,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:800, fontFamily:"monospace",
                    background:`${selSec.color}18`, border:`1px solid ${selSec.color}30`,
                    color:selSec.color }}>
                    {selSec.sector.slice(0,3).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#dce8f5" }}>{selSec.sector}</div>
                    <div style={{ fontSize:10, color:"#5a7592" }}>
                      {selSec.count} incidents · {selSec.yearSpan}
                    </div>
                  </div>
                </div>
                <StackedAttackChart incidents={selSec.incidents} color={selSec.color}/>
                <SeverityBreakdown incidents={selSec.incidents}/>
              </div>
              {/* Right col */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <AttackerNetworkGraph incidents={selSec.incidents} color={selSec.color}/>
                {/* Recent incidents */}
                <div>
                  <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
                    textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
                    Recent Incidents
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5,
                    maxHeight:180, overflowY:"auto",
                    scrollbarWidth:"thin", scrollbarColor:"#1e2538 transparent" }}>
                    {[...selSec.incidents].sort((a,b)=>b.year-a.year).slice(0,6).map(inc => (
                      <div key={inc.id} style={{ padding:"8px 10px", borderRadius:8,
                        border:"1px solid rgba(255,255,255,.05)",
                        background:"rgba(255,255,255,.02)" }}>
                        <div style={{ display:"flex", alignItems:"center",
                          gap:7, marginBottom:3 }}>
                          <span style={{ fontSize:9, fontFamily:"monospace",
                            color:"#3d556e", flexShrink:0 }}>{inc.year}</span>
                          <span style={{ fontSize:11, fontWeight:600,
                            color:"#dce8f5", flex:1, overflow:"hidden",
                            textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inc.threat}</span>
                          <span style={{ fontSize:8, padding:"1px 5px", borderRadius:3,
                            background:`${attackColors[inc.attack]||"#6b7280"}18`,
                            color:attackColors[inc.attack]||"#6b7280",
                            flexShrink:0 }}>{inc.attack}</span>
                        </div>
                        <p style={{ fontSize:10, color:"#5a7592",
                          lineHeight:1.4, paddingLeft:32 }}>{inc.main_point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
