import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { enrichIncidentsForCountry } from "../../lib/relationshipData";
import { YearRangeFilter } from "./ConnectionGraph";
import { attackColors, severityColors } from "../../lib/cyberData";

const SECTOR_COLORS = {
  Technology:"#06b6d4",Healthcare:"#10b981",Finance:"#f59e0b",Government:"#8b5cf6",
  Energy:"#f97316",Retail:"#ec4899",Education:"#84cc16",Defence:"#ef4444",
  Telecom:"#0ea5e9",Media:"#d946ef",Transport:"#fb923c",
};
const SEV_COLORS = { Critical:"#ef4444",High:"#f97316",Medium:"#eab308",Low:"#22c55e" };

function getMostCommon(arr) {
  const f={};
  arr.forEach(x=>{f[x]=(f[x]||0)+1;});
  return Object.entries(f).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—";
}

const CTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"hsl(225,25%,9%)", border:"1px solid rgba(255,255,255,.1)",
      borderRadius:10, padding:"8px 12px", fontSize:11 }}>
      <p style={{ color:"#7a96b5", marginBottom:4 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ color:p.color||p.fill, fontWeight:600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

function SectorDonut({ sector, incidents, color }) {
  const freq = {};
  incidents.forEach(i=>{freq[i.attack]=(freq[i.attack]||0)+1;});
  const data = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8)
    .map(([atk,v]) => ({ name:atk, value:v, color:attackColors[atk]||"#6b7280" }));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"center" }}>
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
              paddingAngle={2} dataKey="value" animationBegin={0} animationDuration={800}>
              {data.map((d,i) => <Cell key={i} fill={d.color} stroke="rgba(0,0,0,.3)" strokeWidth={1}/>)}
            </Pie>
            <Tooltip content={<CTooltip/>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3px 10px" }}>
        {data.map(d => (
          <div key={d.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:d.color, flexShrink:0 }}/>
            <span style={{ fontSize:9.5, color:"#7a96b5", flex:1,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</span>
            <span style={{ fontSize:9.5, fontFamily:"monospace", fontWeight:700, color:d.color }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeverityHeatBar({ incidents }) {
  const sevs = ["Critical","High","Medium","Low"];
  const total = incidents.length || 1;
  const counts = sevs.map(s => ({ s, v:incidents.filter(i=>i.severity===s).length }));
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
        textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
        Severity Distribution
      </div>
      <div style={{ display:"flex", height:10, borderRadius:6, overflow:"hidden", gap:1 }}>
        {counts.map(c => (
          <motion.div key={c.s} initial={{ flex:0 }} animate={{ flex:c.v||0.01 }}
            transition={{ duration:.8, ease:[.25,.46,.45,.94] }}
            style={{ background:SEV_COLORS[c.s], height:"100%", borderRadius:2 }}
            title={`${c.s}: ${c.v}`}/>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, marginTop:5, flexWrap:"wrap" }}>
        {counts.map(c => (
          <div key={c.s} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:6, height:6, borderRadius:2, background:SEV_COLORS[c.s] }}/>
            <span style={{ fontSize:9, color:"#5a7592" }}>{c.s}: </span>
            <span style={{ fontSize:9, fontWeight:700, fontFamily:"monospace",
              color:SEV_COLORS[c.s] }}>{Math.round(c.v/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function YearTrendBar({ incidents, color }) {
  const years = Array.from({length:25},(_,i)=>2001+i);
  const data = years.map(y => ({ y, v:incidents.filter(i=>i.year===y).length }))
    .filter(d=>d.v>0);
  if (data.length < 2) return null;
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
        textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>
        Incident Trend
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={data} margin={{ top:2, right:2, bottom:2, left:0 }}>
          <XAxis dataKey="y" tick={{ fill:"#3d556e", fontSize:8 }} axisLine={false} tickLine={false}/>
          <YAxis hide/>
          <Bar dataKey="v" fill={color} radius={[2,2,0,0]} maxBarSize={16}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function VictimView({ country="US" }) {
  const [selected, setSelected] = useState(null);
  const [yearFrom, setYearFrom] = useState(2001);
  const [yearTo,   setYearTo]   = useState(2025);
  const incidents = enrichIncidentsForCountry(country).filter(i => i.year >= yearFrom && i.year <= yearTo);
  const sectors = [...new Set(incidents.map(i=>i.sector))];
  const sectorData = sectors.map(sec => {
    const incs = incidents.filter(i=>i.sector===sec);
    const critC = incs.filter(i=>i.severity==="Critical").length;
    const risk = Math.min(100, Math.round((critC*3 + incs.filter(i=>i.severity==="High").length*1.5 + incs.length)*4));
    return { sector:sec, color:SECTOR_COLORS[sec]||"#6b7280",
      count:incs.length, incidents:incs, risk,
      topAttack:getMostCommon(incs.map(i=>i.attack)), criticals:critC };
  }).sort((a,b)=>b.risk-a.risk);

  const maxCount = Math.max(...sectorData.map(s=>s.count));
  const selSec = sectorData.find(s=>s.sector===selected);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    <YearRangeFilter yearFrom={yearFrom} yearTo={yearTo} setYearFrom={setYearFrom} setYearTo={setYearTo} />
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      {/* Left — ranked bars */}
      <div style={{ overflowY:"auto", maxHeight:540,
        scrollbarWidth:"thin", scrollbarColor:"#1e2538 transparent" }}>
        <div style={{ fontSize:10, color:"#5a7592", marginBottom:10 }}>
          Ranked by risk score · click to drill down
        </div>
        {sectorData.map((s,i) => (
          <motion.button key={s.sector}
            initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:i*.05 }}
            onClick={() => setSelected(selected===s.sector ? null : s.sector)}
            style={{ width:"100%", textAlign:"left", marginBottom:7, padding:11,
              borderRadius:12, cursor:"pointer",
              border:`1px solid ${selected===s.sector ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.06)"}`,
              background:selected===s.sector ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.02)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontSize:10, fontFamily:"monospace", color:"#3d556e", width:18 }}>{i+1}</span>
              <div style={{ width:9, height:9, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"#dce8f5", flex:1 }}>{s.sector}</span>
              <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:s.color }}>
                {s.count}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ marginLeft:28, height:6, borderRadius:4,
              background:"rgba(255,255,255,.04)", overflow:"hidden" }}>
              <motion.div initial={{ width:0 }}
                animate={{ width:`${(s.count/maxCount)*100}%` }}
                transition={{ duration:.8, delay:i*.05 }}
                style={{ height:"100%", borderRadius:4, background:s.color }}/>
            </div>
            {/* Meta row */}
            <div style={{ marginLeft:28, display:"flex", gap:10, marginTop:5 }}>
              <span style={{ fontSize:9, color:"#5a7592" }}>
                Top: <span style={{ color:attackColors[s.topAttack]||"#6b7280" }}>{s.topAttack}</span>
              </span>
              <span style={{ fontSize:9, color:"#5a7592" }}>{s.criticals} critical</span>
              {/* Risk mini bar */}
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:9, color:"#3d556e" }}>Risk</span>
                <div style={{ width:40, height:4, borderRadius:2,
                  background:"rgba(255,255,255,.04)", overflow:"hidden" }}>
                  <div style={{ width:`${s.risk}%`, height:"100%", borderRadius:2,
                    background:`linear-gradient(90deg,${s.color},#ef4444)` }}/>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Right — visualizations */}
      <div style={{ borderRadius:16, border:"1px solid rgba(255,255,255,.07)",
        background:"rgba(17,20,32,.8)", padding:18, display:"flex",
        flexDirection:"column", gap:14 }}>
        <AnimatePresence mode="wait">
          {selSec ? (
            <motion.div key={selSec.sector} initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", gap:10,
                paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                <div style={{ width:38, height:38, borderRadius:10,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:800, fontFamily:"monospace",
                  background:`${selSec.color}18`, border:`1px solid ${selSec.color}30`,
                  color:selSec.color }}>
                  {selSec.sector.slice(0,3).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#dce8f5" }}>{selSec.sector}</div>
                  <div style={{ fontSize:10, color:"#5a7592" }}>{selSec.count} incidents · risk {selSec.risk}</div>
                </div>
              </div>
              {/* Attack donut */}
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:"#5a7592",
                  textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>
                  Attack Type Distribution
                </div>
                <SectorDonut sector={selSec.sector} incidents={selSec.incidents} color={selSec.color}/>
              </div>
              {/* Severity heatbar */}
              <SeverityHeatBar incidents={selSec.incidents}/>
              {/* Year trend */}
              <YearTrendBar incidents={selSec.incidents} color={selSec.color}/>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ flex:1, display:"flex", alignItems:"center",
                justifyContent:"center", textAlign:"center" }}>
              <p style={{ fontSize:12, color:"#3d556e" }}>Select a sector<br/>to see its visualizations</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
}