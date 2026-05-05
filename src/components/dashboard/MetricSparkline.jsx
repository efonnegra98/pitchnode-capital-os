import React from "react";

export default function MetricSparkline({ data = [], color = "#7C3AED" }) {
  if (!data || data.length < 2) return null;

  const values = data.map(d => d.value).filter(v => v != null && !isNaN(v));
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 80;
  const height = 24;
  const pad = 2;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity="0.7"
      />
      {/* last dot */}
      {values.length > 0 && (() => {
        const last = values[values.length - 1];
        const x = width - pad;
        const y = height - pad - ((last - min) / range) * (height - pad * 2);
        return <circle cx={x} cy={y} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}