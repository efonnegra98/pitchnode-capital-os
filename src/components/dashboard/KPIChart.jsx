import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg px-4 py-3 text-sm">
        <p className="text-white/50 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white font-semibold">
            {p.name}: ${(p.value / 1000).toFixed(1)}k
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function KPIChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">Revenue Trend</h3>
        <div className="h-64 flex items-center justify-center text-white/20 text-sm">
          No data yet. Create monthly updates to see trends.
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">Revenue Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#7c3aed"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}