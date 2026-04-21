import React from "react";
import { TrendingUp, Target, CheckCircle, Clock } from "lucide-react";

export default function RaiseOverview({ settings }) {
  const target = settings.target_raise_amount || 0;
  const committed = settings.capital_committed || 0;
  const soft = settings.soft_commitments || 0;
  
  // Don't show if no target is set
  if (!target) return null;
  
  const remaining = Math.max(0, target - committed);
  const progressPercent = target > 0 ? Math.min(100, (committed / target) * 100) : 0;
  const totalWithSoft = committed + soft;
  const totalPercent = target > 0 ? Math.min(100, (totalWithSoft / target) * 100) : 0;

  const formatCurrency = (val) => {
    if (!val && val !== 0) return "—";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="glass rounded-xl p-6 mb-8 border-2 border-violet-200 dark:border-violet-900/50 relative overflow-hidden">
      {/* Subtle glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 dark:bg-violet-900/20 rounded-full blur-3xl -translate-y-20 translate-x-20" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-violet-600/70 dark:text-violet-400/80 font-medium">
                Raise Command Layer
              </h2>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <h3 className="text-xl font-bold text-foreground dark:text-slate-50">
                {settings.round_type || "Active Round"}
              </h3>
              {settings.target_close_date && (
                <span className="text-xs text-secondary-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Target Close: {formatDate(settings.target_close_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid — padded and rounded to match Financial MetricCards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 metric-glow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-medium">Target</p>
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">{formatCurrency(target)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-emerald-200 metric-glow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-600 font-medium">Committed</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-700 tracking-tight">{formatCurrency(committed)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-amber-200 metric-glow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-amber-600 font-medium">Soft Commits</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700 tracking-tight">{formatCurrency(soft)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 metric-glow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-medium">Remaining</p>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <div className="w-4 h-4 rounded border-2 border-slate-300" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">{formatCurrency(remaining)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary-foreground">Round Progress</span>
            <span className="text-violet-600 dark:text-violet-400 font-semibold">{progressPercent.toFixed(1)}% committed</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            {/* Soft commitments (lighter background) */}
            <div
              className="absolute inset-y-0 left-0 bg-violet-200 dark:bg-violet-800/50 transition-all duration-500"
              style={{ width: `${totalPercent}%` }}
            />
            {/* Hard commitments (solid) */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-violet-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">
              {formatCurrency(committed)} / {formatCurrency(target)}
            </span>
            {soft > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                +{formatCurrency(soft)} soft
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}