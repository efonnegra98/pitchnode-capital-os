import React from "react";

export default function MetricCard({ label, value, subtext, icon: Icon, trend, trendDirection }) {
  return (
    <div className="glass rounded-xl p-5 metric-glow group hover:bg-slate-50 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-medium">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-violet-600" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={`text-xs font-medium ${trendDirection === 'up' ? 'text-emerald-600' : trendDirection === 'down' ? 'text-red-600' : 'text-slate-400'}`}>
            {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '–'} {trend}
          </span>
        )}
        {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
      </div>
    </div>
  );
}