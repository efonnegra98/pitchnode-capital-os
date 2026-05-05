import React, { useState } from "react";
import { Zap, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info } from "lucide-react";

const SEVERITY_CONFIG = {
  priority: {
    label: "Priority",
    icon: AlertTriangle,
    containerClass: "bg-red-50 border-red-200 dark:bg-[#2d1515] dark:border-[#3d2020]",
    badgeClass: "bg-red-100 text-red-700 border-red-200 dark:bg-[#3d1a1a] dark:text-[#ff6b6b] dark:border-[#3d2020]",
    iconClass: "text-red-500 dark:text-[#ff6b6b]",
    textClass: "text-red-900 dark:text-[#ff6b6b]",
    detailClass: "text-red-700/70 dark:text-[#ff6b6b]/70",
    dotClass: "bg-red-500",
  },
  attention: {
    label: "Attention",
    icon: AlertCircle,
    containerClass: "bg-amber-50 border-amber-200 dark:bg-[#2d2510] dark:border-[#3d2e10]",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-[#3d2e0a] dark:text-[#ffa94d] dark:border-[#3d2e10]",
    iconClass: "text-amber-500 dark:text-[#ffa94d]",
    textClass: "text-amber-900 dark:text-[#ffa94d]",
    detailClass: "text-amber-700/70 dark:text-[#ffa94d]/70",
    dotClass: "bg-amber-400",
  },
  info: {
    label: "Info",
    icon: Info,
    containerClass: "bg-blue-50 border-blue-200",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    iconClass: "text-blue-500",
    textClass: "text-blue-900",
    detailClass: "text-blue-700/70",
    dotClass: "bg-blue-400",
  },
};

function SignalRow({ signal }) {
  const cfg = SEVERITY_CONFIG[signal.severity];
  const Icon = cfg.icon;

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${cfg.containerClass}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.iconClass}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded border ${cfg.badgeClass}`}>
              {cfg.label}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{signal.module}</span>
          </div>
          <p className={`text-sm font-medium leading-snug ${cfg.textClass}`}>{signal.message}</p>
          {signal.detail && (
            <p className={`text-xs mt-0.5 leading-relaxed ${cfg.detailClass}`}>{signal.detail}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RaiseSignals({ signals = [] }) {
  const [collapsed, setCollapsed] = useState(false);

  const priorityCount = signals.filter(s => s.severity === "priority").length;
  const attentionCount = signals.filter(s => s.severity === "attention").length;
  const infoCount = signals.filter(s => s.severity === "info").length;

  if (signals.length === 0) {
    return (
      <div className="glass rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-700">Raise Signals</p>
          <p className="text-xs text-slate-400 mt-0.5">No active signals — all systems nominal.</p>
        </div>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
          Clear
        </span>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 flex-1">
          <Zap className="w-4 h-4 text-violet-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-800">Raise Signals</span>
          <div className="flex items-center gap-1.5 ml-2">
            {priorityCount > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-red-100 text-red-700 border-red-200">
                {priorityCount} Priority
              </span>
            )}
            {attentionCount > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-amber-100 text-amber-700 border-amber-200">
                {attentionCount} Attention
              </span>
            )}
            {infoCount > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-200">
                {infoCount} Info
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium mr-2 hidden sm:block">
          {signals.length} signal{signals.length !== 1 ? "s" : ""}
        </span>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {/* Signal list */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2 border-t border-slate-100">
          <div className="pt-3 space-y-2">
            {signals.map(signal => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 pt-1 text-right tracking-wide">
            Powered by Raise Signals · Updates on page load
          </p>
        </div>
      )}
    </div>
  );
}