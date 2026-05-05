import React from "react";
import { Flame } from "lucide-react";

function getBurnConfig(bm) {
  if (bm === null || bm === undefined || isNaN(bm)) return null;
  if (bm < 0) return { label: "Critical", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500", pct: 100 };
  if (bm <= 1) return { label: "Excellent", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500", pct: Math.min(100, bm * 50) };
  if (bm <= 1.5) return { label: "Good", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", bar: "bg-blue-500", pct: Math.min(100, bm * 50) };
  if (bm <= 2) return { label: "Fair", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-400", pct: Math.min(100, bm * 40) };
  return { label: "High", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-500", pct: 100 };
}

export default function BurnMultipleCard({ burnRate, newMRR }) {
  // Burn multiple = Net Burn / Net New ARR = burnRate / (newMRR * 12)
  const newARR = newMRR ? newMRR * 12 : null;
  const bm = burnRate && newARR && newARR !== 0 ? burnRate / newARR : null;
  const cfg = getBurnConfig(bm);

  return (
    <div className={`glass rounded-xl p-5 metric-glow border ${cfg ? cfg.border : "border-slate-200"} ${cfg ? cfg.bg : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-medium">Burn Multiple</p>
        <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
      </div>
      {bm !== null ? (
        <>
          <div className="flex items-baseline gap-2 mb-1">
            <p className={`text-2xl font-bold tracking-tight ${cfg.color}`}>{bm.toFixed(2)}x</p>
            <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
          </div>
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-2">
            <div className={`h-full ${cfg.bar} rounded-full transition-all duration-500`} style={{ width: `${cfg.pct}%` }} />
          </div>
        </>
      ) : (
        <p className="text-2xl font-bold text-slate-300 mb-2">—</p>
      )}
      <p className="text-[10px] text-slate-400 leading-relaxed">
        How efficiently you're growing. <span className="font-semibold text-slate-500">Under 1x is world class.</span>
      </p>
    </div>
  );
}