import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { enrichIncidentsForCountry } from "../../lib/relationshipData";
import { YearRangeFilter } from "./ConnectionGraph";
import { attackColors, severityColors } from "../../lib/cyberData";

const SECTOR_COLORS = {
  Technology:"#06b6d4",Healthcare:"#10b981",Finance:"#f59e0b",Government:"#8b5cf6",
  Energy:"#f97316",Retail:"#ec4899",Education:"#84cc16",Defence:"#ef4444",
  Telecom:"#0ea5e9",Media:"#d946ef",Transport:"#fb923c",
};

function getFreq(arr) {
  const f={};
  arr.forEach(x=>{f[x]=(f[x]||0)+1;});
  return Object.entries(f).sort((a,b)=>b[1]-a[1]);
}

const CTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"hsl(225,25%,9%)", border:"1px solid rgba(255,255,255,.1)",
      borderRadius:10, padding:"8px 12px", fontSize:11 }}>
      <p style={{ color:"#7a96b5", marginBottom:3 }}>{label}</p>
      {payload.map(p=>(
        <div key={p.dataKey} style={{ color:p.color||p.stroke, fontWeight:600 }}>
          {p.name||p.dataKey}: {p.value}
        </div>
      ))}
    </div>
  );
};

function AttackTrendLine({ incidents, color, attackType }) {
  const years = Array.from({length:25},(_,i)=>2001+i);
  const data = years.map(y => ({
    year:String(y),
    count:incidents.filter(i=>i.year===y).length,
  }));
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
        textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>
        Frequency Over Time
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top:5, right:5, bottom:5, left:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
          <XAxis dataKey="year" tick={{ fill:"#3d556e", fontSize:8 }}
            axisLine={false} tickLine={false} interval={4}/>
          <YAxis tick={{ fill:"#3d556e", fontSize:8 }} axisLine={false} tickLine={false} width={20}/>
          <Tooltip content={<CTooltip/>}/>
          <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2.5}
            dot={{ fill:color, r:3 }} activeDot={{ r:5, strokeWidth:0 }}
            name="Incidents"/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopSectorsBar({ incidents, color }) {
  const freq = getFreq(incidents.map(i=>i.sector)).slice(0,6);
  const max = freq[0]?.[1] || 1;
  const data = freq.map(([s,v]) => ({ s, v, c:SECTOR_COLORS[s]||"#6b7280" }));
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
        textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
        Top Target Sectors
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} layout="vertical"
          margin={{ top:0, right:40, bottom:0, left:60 }}>
          <XAxis type="number" hide/>
          <YAxis type="category" dataKey="s"
            tick={{ fill:"#7a96b5", fontSize:10 }} axisLine={false} tickLine={false} width={60}/>
          <Tooltip content={<CTooltip/>}/>
          <Bar dataKey="v" radius={[0,4,4,0]} name="Incidents">
            {data.map((d,i) => <Cell key={i} fill={d.c}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ActorMatrix({ incidents, color }) {
  const freq = getFreq(incidents.map(i=>i.attacker).filter(a=>a!=="unknown")).slice(0,5);
  if (!freq.length) return null;
  const max = freq[0]?.[1]||1;
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
        textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
        Top Threat Actors
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {freq.map(([actor,v],i) => (
          <motion.div key={actor} initial={{ opacity:0, x:-16 }}
            animate={{ opacity:1, x:0 }} transition={{ delay:i*.06 }}
            style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:10, color:"#7a96b5", minWidth:90,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {actor.replace(/([A-Z])/g," $1").trim()}
            </span>
            <div style={{ flex:1, height:6, background:"rgba(255,255,255,.04)",
              borderRadius:3, overflow:"hidden" }}>
              <motion.div initial={{ width:0 }}
                animate={{ width:`${(v/max)*100}%` }}
                transition={{ duration:.7, delay:.2+i*.06 }}
                style={{ height:"100%", borderRadius:3, background:color }}/>
            </div>
            <span style={{ fontSize:9, fontFamily:"monospace", color, minWidth:16 }}>{v}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function AttackTypeView({ country="US" }) {
  const [selected, setSelected] = useState(null);
  const [yearFrom, setYearFrom] = useState(2001);
  const [yearTo,   setYearTo]   = useState(2025);
  const incidents = enrichIncidentsForCountry(country).filter(i => i.year >= yearFrom && i.year <= yearTo);
  const attacks = [...new Set(incidents.map(i=>i.attack))];
  const attackData = attacks.map(atk => {
    const incs = incidents.filter(i=>i.attack===atk);
    return {
      attack:atk, color:attackColors[atk]||"#6b7280",
      count:incs.length, incidents:incs,
      topSectors:getFreq(incs.map(i=>i.sector)).slice(0,3),
      criticals:incs.filter(i=>i.severity==="Critical").length,
      yearRange:`${Math.min(...incs.map(i=>i.year))}–${Math.max(...incs.map(i=>i.year))}`,
    };
  }).sort((a,b)=>b.count-a.count);

  const maxCount = Math.max(...attackData.map(a=>a.count));
  const selAtk = attackData.find(a=>a.attack===selected);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    <YearRangeFilter yearFrom={yearFrom} yearTo={yearTo} setYearFrom={setYearFrom} setYearTo={setYearTo} />
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      {/* Left */}
      <div style={{ overflowY:"auto", maxHeight:540,
        scrollbarWidth:"thin", scrollbarColor:"#1e2538 transparent" }}>
        <div style={{ fontSize:10, color:"#5a7592", marginBottom:10 }}>
          Ranked by frequency — click to explore
        </div>
        {attackData.map((a,i) => (
          <motion.button key={a.attack}
            initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:i*.06 }}
            onClick={() => setSelected(selected===a.attack ? null : a.attack)}
            style={{ width:"100%", textAlign:"left", marginBottom:7, padding:11,
              borderRadius:12, cursor:"pointer",
              border:`1px solid ${selected===a.attack ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.06)"}`,
              background:selected===a.attack ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.02)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <div style={{ width:30, height:30, borderRadius:8, flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:800, fontFamily:"monospace",
                background:`${a.color}18`, border:`1px solid ${a.color}30`, color:a.color }}>
                {i+1}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#dce8f5" }}>{a.attack}</span>
                  <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4,
                    fontFamily:"monospace", fontWeight:700,
                    background:`${a.color}18`, color:a.color }}>{a.count}</span>
                </div>
                <div style={{ fontSize:9, color:"#3d556e", marginTop:2 }}>{a.yearRange}</div>
              </div>
              <span style={{ fontSize:9, color:"#5a7592" }}>{a.criticals} critical</span>
            </div>
            <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,.04)",
              overflow:"hidden", marginBottom:6 }}>
              <motion.div initial={{ width:0 }}
                animate={{ width:`${(a.count/maxCount)*100}%` }}
                transition={{ duration:.8, delay:i*.06 }}
                style={{ height:"100%", borderRadius:3, background:a.color }}/>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {a.topSectors.slice(0,3).map(([s,v]) => (
                <span key={s} style={{ fontSize:8, padding:"1px 6px", borderRadius:3,
                  background:`${SECTOR_COLORS[s]||"#6b7280"}14`,
                  color:SECTOR_COLORS[s]||"#6b7280" }}>{s}</span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Right */}
      <div style={{ borderRadius:16, border:"1px solid rgba(255,255,255,.07)",
        background:"rgba(17,20,32,.8)", padding:18, display:"flex",
        flexDirection:"column", gap:14 }}>
        <AnimatePresence mode="wait">
          {selAtk ? (
            <motion.div key={selAtk.attack} initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {/* Header */}
              <div style={{ paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:selAtk.color }}/>
                  <span style={{ fontSize:15, fontWeight:800, color:"#dce8f5" }}>{selAtk.attack}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
                  {[
                    { l:"Total",    v:selAtk.count },
                    { l:"Critical", v:selAtk.criticals },
                    { l:"Sectors",  v:[...new Set(selAtk.incidents.map(i=>i.sector))].length },
                  ].map(s => (
                    <div key={s.l} style={{ borderRadius:8, border:"1px solid rgba(255,255,255,.06)",
                      padding:"6px 8px", textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:800, fontFamily:"monospace",
                        color:selAtk.color }}>{s.v}</div>
                      <div style={{ fontSize:8, color:"#5a7592" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <AttackTrendLine incidents={selAtk.incidents} color={selAtk.color} attackType={selAtk.attack}/>
              <TopSectorsBar incidents={selAtk.incidents} color={selAtk.color}/>
              <ActorMatrix incidents={selAtk.incidents} color={selAtk.color}/>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ flex:1, display:"flex", alignItems:"center",
                justifyContent:"center", color:"#3d556e", fontSize:12, textAlign:"center" }}>
              Select an attack type<br/>to see its visualizations
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
}