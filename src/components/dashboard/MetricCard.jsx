import React from "react";

export default function MetricCard({ label, value, subtext, icon: Icon, trend, trendDirection }) {
  return (
    <div className="glass rounded-xl p-5 metric-glow group hover:bg-white/[0.05] transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-violet-400/70" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={`text-xs font-medium ${trendDirection === 'up' ? 'text-emerald-400' : trendDirection === 'down' ? 'text-red-400' : 'text-white/30'}`}>
            {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '–'} {trend}
          </span>
        )}
        {subtext && <span className="text-xs text-white/25">{subtext}</span>}
      </div>
    </div>
  );
}