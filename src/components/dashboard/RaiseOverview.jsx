import React from "react";
import { TrendingUp, Target, CheckCircle, Clock } from "lucide-react";

export default function RaiseOverview({ settings }) {
  const target = settings.target_raise_amount || 0;
  const committed = settings.capital_committed || 0;
  const soft = settings.soft_commitments || 0;
  const remaining = Math.max(0, target - committed);
  const progressPercent = target > 0 ? Math.min(100, (committed / target) * 100) : 0;
  const totalWithSoft = committed + soft;
  const totalPercent = target > 0 ? Math.min(100, (totalWithSoft / target) * 100) : 0;

  const formatCurrency = (val) => {
    if (!val && val !== 0) return "$0";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="glass rounded-xl p-6 mb-8 border-2 border-violet-200 relative overflow-hidden">
      {/* Subtle glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 rounded-full blur-3xl -translate-y-20 translate-x-20" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-violet-600/70 font-medium">
                Raise Command Layer
              </h2>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <h3 className="text-xl font-bold text-slate-800">
                {settings.round_type || "Active Round"}
              </h3>
              {settings.target_close_date && (
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Target Close: {formatDate(settings.target_close_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3.5 h-3.5 text-violet-600" />
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium">Target</p>
            </div>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(target)}</p>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-600 font-medium">Committed</p>
            </div>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(committed)}</p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-[10px] uppercase tracking-[0.15em] text-amber-600 font-medium">Soft</p>
            </div>
            <p className="text-xl font-bold text-amber-700">{formatCurrency(soft)}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3.5 h-3.5 rounded border border-slate-300" />
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium">Remaining</p>
            </div>
            <p className="text-xl font-bold text-slate-600">{formatCurrency(remaining)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Round Progress</span>
            <span className="text-violet-600 font-semibold">{progressPercent.toFixed(1)}% committed</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
            {/* Soft commitments (lighter background) */}
            <div
              className="absolute inset-y-0 left-0 bg-violet-200 transition-all duration-500"
              style={{ width: `${totalPercent}%` }}
            />
            {/* Hard commitments (solid) */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-violet-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              {formatCurrency(committed)} / {formatCurrency(target)}
            </span>
            {soft > 0 && (
              <span className="text-amber-600">
                +{formatCurrency(soft)} soft
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}