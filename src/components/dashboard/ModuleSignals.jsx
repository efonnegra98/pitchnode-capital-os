import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

/**
 * Inline signal strip shown at the top of each dashboard module.
 * Only renders if there are signals for this module.
 */

const SEVERITY_CONFIG = {
  priority: {
    icon: AlertTriangle,
    containerClass: "bg-red-50 border-red-200",
    iconClass: "text-red-500",
    textClass: "text-red-800",
    badgeClass: "bg-red-100 text-red-700 border border-red-200",
    label: "Priority",
  },
  attention: {
    icon: AlertCircle,
    containerClass: "bg-amber-50 border-amber-200",
    iconClass: "text-amber-500",
    textClass: "text-amber-800",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    label: "Attention",
  },
  info: {
    icon: Info,
    containerClass: "bg-blue-50 border-blue-200",
    iconClass: "text-blue-500",
    textClass: "text-blue-800",
    badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
    label: "Info",
  },
};

export default function ModuleSignals({ signals = [] }) {
  if (!signals || signals.length === 0) return null;

  // Show only top 2 for inline display
  const topSignals = signals.slice(0, 2);

  return (
    <div className="mb-4 space-y-1.5">
      {topSignals.map(signal => {
        const cfg = SEVERITY_CONFIG[signal.severity];
        const Icon = cfg.icon;
        return (
          <div
            key={signal.id}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 ${cfg.containerClass}`}
          >
            <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.iconClass}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${cfg.badgeClass}`}>
                  {cfg.label}
                </span>
              </div>
              <p className={`text-xs font-medium leading-snug ${cfg.textClass}`}>{signal.message}</p>
            </div>
          </div>
        );
      })}
      {signals.length > 2 && (
        <p className="text-[10px] text-slate-400 pl-1">+{signals.length - 2} more signal{signals.length - 2 > 1 ? "s" : ""} in Raise Signals panel</p>
      )}
    </div>
  );
}