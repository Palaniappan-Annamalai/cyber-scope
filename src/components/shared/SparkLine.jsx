// Tiny inline sparkline showing 5-year attack frequency trend for a sector
import { useMemo } from "react";
import { usaCyberThreats } from "../../lib/cyberData";

export default function SparkLine({ sector, color, width = 40, height = 16 }) {
  const points = useMemo(() => {
    const years = [2017, 2019, 2021, 2022, 2023, 2024, 2025];
    return years.map(y => usaCyberThreats.filter(d => d.year === y && d.sector === sector).length);
  }, [sector]);

  const max = Math.max(...points, 1);
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} style={{ overflow: "visible", flexShrink: 0 }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Last point dot */}
      {points.length > 0 && (
        <circle
          cx={(points.length - 1) / (points.length - 1) * width}
          cy={height - (points[points.length - 1] / max) * height}
          r="2"
          fill={color}
        />
      )}
    </svg>
  );
}
