import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { year: "2020", "System Intrusion": 22, "Social Engineering": 17, "Basic Web App": 26, "Misc Errors": 17, "Privilege Misuse": 8 },
  { year: "2021", "System Intrusion": 28, "Social Engineering": 25, "Basic Web App": 21, "Misc Errors": 16, "Privilege Misuse": 6 },
  { year: "2022", "System Intrusion": 35, "Social Engineering": 28, "Basic Web App": 24, "Misc Errors": 14, "Privilege Misuse": 5 },
  { year: "2023", "System Intrusion": 42, "Social Engineering": 25, "Basic Web App": 20, "Misc Errors": 14, "Privilege Misuse": 6 },
  { year: "2024", "System Intrusion": 36, "Social Engineering": 22, "Basic Web App": 9, "Misc Errors": 25, "Privilege Misuse": 8 },
  { year: "2025", "System Intrusion": 53, "Social Engineering": 17, "Basic Web App": 18, "Misc Errors": 12, "Privilege Misuse": 7 },
  { year: "2026", "System Intrusion": 61, "Social Engineering": 17, "Basic Web App": 10, "Misc Errors": 8, "Privilege Misuse": 3 },
];

const lines = [
  { key: "System Intrusion", color: "#ef4444", width: 2.5 },
  { key: "Social Engineering", color: "#06b6d4", width: 1.5 },
  { key: "Basic Web App", color: "#f97316", width: 1.5 },
  { key: "Misc Errors", color: "#eab308", width: 1.5 },
  { key: "Privilege Misuse", color: "#a855f7", width: 1.5 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-mono text-muted-foreground mb-2">{label}</p>
      {[...payload].sort((a, b) => b.value - a.value).map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.dataKey}:</span>
          <span className="font-semibold font-mono" style={{ color: p.color }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function BreachTrendLine() {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Breach Patterns Over Time (2020–2026)</h3>
        <p className="text-xs text-muted-foreground">Inspired by VDBIR Fig. 40 — System Intrusion is the defining threat of the decade.</p>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={32} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            {lines.map(l => (
              <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={l.width}
                dot={{ fill: l.color, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3">
        {lines.map(l => (
          <div key={l.key} className="flex items-center gap-1.5 text-xs">
            <div className="w-5 h-0.5 rounded" style={{ backgroundColor: l.color }} />
            <span className="text-muted-foreground">{l.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}