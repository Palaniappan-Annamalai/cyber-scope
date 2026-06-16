import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const events = [
  { month: "Feb", label: "DeepSeek launch", model: "DeepSeek", x: "Feb" },
  { month: "Mar", label: "Grok 3 release", model: "Grok", x: "Mar" },
  { month: "Jun", label: "ChatGPT outage", model: "ChatGPT", x: "Jun" },
  { month: "Aug", label: "OpenAI GPT-5 release", model: "ChatGPT", x: "Aug" },
  { month: "Nov", label: "ChatGPT outage", model: "ChatGPT", x: "Nov" },
  { month: "Dec", label: "Gemini 3 Pro release", model: "Gemini", x: "Dec" },
];

const modelColors = {
  ChatGPT: "#ef4444",
  Gemini: "#f97316",
  Grok: "#374151",
  DeepSeek: "#06b6d4",
  Claude: "#8b5cf6",
  Qwen: "#6b7280",
  Llama: "#eab308",
  Perplexity: "#ec4899",
  Mistral: "#a855f7",
};

export default function TimelineChart({ data, activeModels, onToggleModel }) {
  const [tooltip, setTooltip] = useState(null);
  const models = Object.keys(modelColors);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
        <p className="text-xs font-mono text-muted-foreground mb-2">{label} 2025</p>
        {payload.sort((a, b) => b.value - a.value).slice(0, 5).map(p => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.dataKey}:</span>
            <span className="font-mono font-semibold text-foreground">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Model toggles */}
      <div className="flex flex-wrap gap-2">
        {models.map(model => (
          <button
            key={model}
            onClick={() => onToggleModel(model)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              activeModels.includes(model)
                ? "border-transparent text-white"
                : "border-border bg-transparent text-muted-foreground opacity-40"
            }`}
            style={activeModels.includes(model) ? { backgroundColor: modelColors[model] } : {}}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
            {model}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} />
            {events.map(ev => (
              <ReferenceLine
                key={ev.label}
                x={ev.month}
                stroke={modelColors[ev.model]}
                strokeDasharray="3 3"
                strokeOpacity={0.4}
                label={{ value: "!", fill: modelColors[ev.model], fontSize: 10, position: "top" }}
              />
            ))}
            {models.filter(m => activeModels.includes(m)).map(model => (
              <Line
                key={model}
                type="monotone"
                dataKey={model}
                stroke={modelColors[model]}
                strokeWidth={model === "ChatGPT" ? 2.5 : 1.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Event annotations */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {events.map(ev => (
          <div key={ev.label} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-border/30">
            <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: modelColors[ev.model] }} />
            <div>
              <p className="text-xs text-muted-foreground font-mono">{ev.month}</p>
              <p className="text-xs text-foreground/80 leading-tight">{ev.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}