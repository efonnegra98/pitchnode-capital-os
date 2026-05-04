import React from "react";
import { Sparkles, AlertCircle, ArrowRight, Clock } from "lucide-react";
import { getSmartNextAction } from "../../lib/nextActionSuggestion";

const urgencyConfig = {
  high:   { border: "border-red-200",    bg: "bg-red-50",    icon: AlertCircle, iconColor: "text-red-500",    label: "text-red-700",    badge: "bg-red-100 text-red-700 border-red-200"   },
  medium: { border: "border-amber-200",  bg: "bg-amber-50",  icon: Clock,       iconColor: "text-amber-500",  label: "text-amber-800",  badge: "bg-amber-100 text-amber-700 border-amber-200" },
  low:    { border: "border-slate-200",  bg: "bg-slate-50",  icon: Sparkles,    iconColor: "text-slate-400",  label: "text-slate-600",  badge: "bg-slate-100 text-slate-500 border-slate-200" },
};

/**
 * variant="inline" — compact single-line for table rows
 * variant="card"   — full card for the detail modal
 */
export default function SmartNextAction({ investor, variant = "card" }) {
  const { action, reason, urgency } = getSmartNextAction(investor);
  const c = urgencyConfig[urgency];
  const Icon = c.icon;

  if (variant === "inline") {
    return (
      <div className={`flex items-start gap-1.5 text-[11px] leading-snug`}>
        <Icon className={`w-3 h-3 flex-shrink-0 mt-0.5 ${c.iconColor}`} />
        <div>
          <span className={`font-semibold ${c.label}`}>{action}</span>
          {reason && <span className="text-slate-400"> — {reason}</span>}
        </div>
      </div>
    );
  }

  // card variant
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} px-4 py-3 flex items-start gap-3`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${c.bg} border ${c.border}`}>
        <Icon className={`w-3.5 h-3.5 ${c.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${c.badge}`}>
            {urgency === "high" ? "Act Now" : urgency === "medium" ? "This Week" : "When Ready"}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-violet-500 font-semibold">
            <Sparkles className="w-3 h-3" /> AI Suggested
          </span>
        </div>
        <p className={`text-sm font-semibold ${c.label}`}>{action}</p>
        {reason && <p className="text-xs text-slate-500 mt-0.5">{reason}</p>}
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
    </div>
  );
}