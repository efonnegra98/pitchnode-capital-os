import React, { useState } from "react";
import { Copy, Check, Zap } from "lucide-react";

function fmt(val, type = "currency") {
  if (!val && val !== 0) return "—";
  if (type === "currency") {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  }
  if (type === "pct") return `${val > 0 ? "+" : ""}${Number(val).toFixed(1)}%`;
  if (type === "x") return `${Number(val).toFixed(2)}x`;
  return String(val);
}

export default function InvestorMetricsSummary({ mrr, momGrowth, burnRate, runway, burnMultiple }) {
  const [copied, setCopied] = useState(false);

  const arr = mrr ? mrr * 12 : null;

  const bmConfig = (() => {
    if (burnMultiple === null || burnMultiple === undefined || isNaN(burnMultiple)) return null;
    if (burnMultiple < 0) return { label: "Critical", color: "text-red-600" };
    if (burnMultiple <= 1) return { label: "Excellent", color: "text-emerald-600" };
    if (burnMultiple <= 1.5) return { label: "Good", color: "text-blue-600" };
    if (burnMultiple <= 2) return { label: "Fair", color: "text-amber-600" };
    return { label: "High", color: "text-orange-600" };
  })();

  const handleCopy = () => {
    const lines = [
      `📊 Key Metrics`,
      `MRR: ${fmt(mrr)}`,
      `ARR: ${fmt(arr)}`,
      `MoM Growth: ${fmt(momGrowth, "pct")}`,
      `Burn Rate: ${fmt(burnRate)}/mo`,
      `Runway: ${runway ? `${runway} months` : "—"}`,
      burnMultiple != null ? `Burn Multiple: ${fmt(burnMultiple, "x")} (${bmConfig?.label || ""})` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-bold text-violet-800 uppercase tracking-wider">What Investors Will Ask</h3>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            copied ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
        >
          {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Summary</>}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "MRR", value: fmt(mrr), sub: arr ? `ARR ${fmt(arr)}` : null },
          { label: "MoM Growth", value: fmt(momGrowth, "pct"), sub: "month-over-month" },
          { label: "Burn / Month", value: fmt(burnRate), sub: burnMultiple != null ? `${fmt(burnMultiple, "x")} multiple` : null },
          { label: "Runway", value: runway ? `${runway} mo` : "—", sub: "cash remaining" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white/70 rounded-xl px-4 py-3 text-center border border-violet-100">
            <p className="text-[10px] text-violet-500 uppercase tracking-widest font-semibold mb-1">{label}</p>
            <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-violet-400 mt-3 text-center">
        These are the 4 metrics investors check first. Keep them current.
      </p>
    </div>
  );
}