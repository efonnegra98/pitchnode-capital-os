import React, { useState } from "react";
import { TrendingUp, Target, CheckCircle, Clock, ArrowUp, AlertTriangle, CheckCircle2, Pencil, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

// ── helpers ─────────────────────────────────────────────────────────────────
const fmt = (val) => {
  if (!val && val !== 0) return "—";
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val.toLocaleString()}`;
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  : "—";

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.ceil(diff / 86_400_000);
};

const startOfWeek = () => {
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - d.getDay());
  return d;
};

const ROUND_BADGE = {
  "Pre-Seed":  "bg-violet-100 text-violet-700 border-violet-200",
  "Seed":      "bg-blue-100 text-blue-700 border-blue-200",
  "Series A":  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Series B":  "bg-amber-100 text-amber-700 border-amber-200",
  "Series C+": "bg-slate-100 text-slate-700 border-slate-200",
  "Bridge":    "bg-orange-100 text-orange-700 border-orange-200",
};

// ── inline editable number field ─────────────────────────────────────────────
function EditableNumber({ value, onSave, placeholder, className = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const start = () => { setDraft(value ? String(value) : ""); setEditing(true); };
  const cancel = () => setEditing(false);
  const save = async () => {
    const n = parseFloat(draft.replace(/[^0-9.]/g, ""));
    if (!isNaN(n)) await onSave(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          className="w-28 text-sm border border-violet-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-violet-400"
          placeholder={placeholder}
        />
        <button onClick={save} className="text-emerald-600 hover:text-emerald-700"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={cancel} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
      </span>
    );
  }

  return (
    <button
      onClick={start}
      className={`inline-flex items-center gap-1 group hover:opacity-80 transition-opacity ${className}`}
    >
      <span>{value ? fmt(value) : <span className="text-slate-400 italic text-xs">{placeholder || "Set"}</span>}</span>
      <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function RoundBadgeRow({ settings, daysLeft }) {
  const roundType = settings.round_type;
  const badgeClass = ROUND_BADGE[roundType] || "bg-slate-100 text-slate-600 border-slate-200";

  let countdownEl = null;
  if (daysLeft === null) {
    countdownEl = (
      <span className="text-[11px] text-slate-400 italic">Set a target close date to track pace</span>
    );
  } else if (daysLeft < 0) {
    countdownEl = (
      <span className="text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
        Close date passed — update your round
      </span>
    );
  } else {
    const color = daysLeft > 60
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : daysLeft > 30
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-red-700 bg-red-50 border-red-200";
    countdownEl = (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold border rounded-full px-2.5 py-0.5 ${color}`}>
        <Clock className="w-3 h-3" />
        {daysLeft} days to close · {fmtDate(settings.target_close_date)}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {roundType && (
        <span className={`text-[11px] font-bold uppercase tracking-wider border rounded-full px-3 py-0.5 ${badgeClass}`}>
          {roundType}
        </span>
      )}
      {countdownEl}
    </div>
  );
}

function WeeklyMomentum({ investors }) {
  const weekStart = startOfWeek();

  // New investors moved to active stages this week (any activity_log entry this week)
  const activeStages = ["Outreach Sent","Intro Call Scheduled","Intro Call Complete","Interest Confirmed","Diligence","Term Sheet"];
  const newActiveThisWeek = investors.filter(inv => {
    if (!activeStages.includes(inv.funnel_stage)) return false;
    const log = inv.activity_log || [];
    return log.some(e => new Date(e.timestamp) >= weekStart);
  }).length;

  // Capital committed this week — we track by updated_date if committed changed (best proxy)
  // We use investors updated this week that are Committed with capital data as a signal
  // Since we don't have timestamped capital fields, we approximate from activity_log entries this week
  const committedThisWeek = investors.filter(inv =>
    inv.funnel_stage === "Closed Won" &&
    (inv.activity_log || []).some(e => new Date(e.timestamp) >= weekStart)
  ).length;

  const noActivity = committedThisWeek === 0 && newActiveThisWeek === 0;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">This Week</p>
      {noActivity ? (
        <p className="text-xs text-slate-400 italic">No activity logged this week — time to reach out.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {newActiveThisWeek > 0 && (
            <div className="flex items-center gap-1.5">
              <ArrowUp className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-sm font-bold text-violet-700">{newActiveThisWeek}</span>
              <span className="text-xs text-slate-500">investor{newActiveThisWeek !== 1 ? "s" : ""} moved to active stages</span>
            </div>
          )}
          {committedThisWeek > 0 && (
            <div className="flex items-center gap-1.5">
              <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">{committedThisWeek}</span>
              <span className="text-xs text-slate-500">new close{committedThisWeek !== 1 ? "s" : ""} logged</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PaceIndicator({ committed, target, daysLeft }) {
  if (!target || !daysLeft || daysLeft < 0) return null;

  const remaining = Math.max(0, target - committed);
  const progressPct = target > 0 ? (committed / target) * 100 : 0;

  // Weeks remaining
  const weeksLeft = daysLeft / 7;

  // Required weekly pace to close
  const weeklyRequired = weeksLeft > 0 ? remaining / weeksLeft : Infinity;

  // Estimate what % will be reached at current pace
  // We need a "current weekly pace" — use committed / (days since round start if known, else fallback)
  // Approximate: assume 12 week fundraise on average, already committed X
  const weeksElapsed = Math.max(1, (84 - daysLeft) / 7); // assume 12 week round
  const currentWeeklyPace = committed / weeksElapsed;

  const projectedAtClose = committed + currentWeeklyPace * weeksLeft;
  const projectedPct = target > 0 ? Math.min(100, (projectedAtClose / target) * 100) : 0;

  let state;
  if (projectedPct >= 95) {
    state = "on_pace";
  } else if (projectedPct >= 60) {
    state = "behind";
  } else {
    state = "critical";
  }

  const configs = {
    on_pace: {
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      label: "On Pace",
      labelColor: "text-emerald-700",
      message: `You are on track to hit your target by the close date.`,
    },
    behind: {
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      bg: "bg-amber-50 border-amber-200",
      label: "Behind Pace",
      labelColor: "text-amber-700",
      message: `At current pace you'll reach ~${Math.round(projectedPct)}% of your target by close date. You need ${fmt(Math.round(weeklyRequired))} more per week to stay on track.`,
    },
    critical: {
      icon: AlertTriangle,
      iconColor: "text-red-500",
      bg: "bg-red-50 border-red-200",
      label: "Critical",
      labelColor: "text-red-700",
      message: `Significant gap to close. Consider accelerating outreach or extending your timeline. Required pace: ${fmt(Math.round(weeklyRequired))}/week.`,
    },
  };

  const cfg = configs[state];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 mt-3 ${cfg.bg}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
      <div>
        <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.labelColor}`}>{cfg.label}</span>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{cfg.message}</p>
      </div>
    </div>
  );
}

function ValuationRow({ settings, companyId, queryClient }) {
  const pre = settings.pre_money_valuation || 0;
  const target = settings.target_raise_amount || 0;
  const post = pre + target;

  const save = async (value) => {
    await base44.entities.Company.update(companyId, { pre_money_valuation: value });
    queryClient.invalidateQueries({ queryKey: ["company"] });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 pt-3 mt-1 border-t border-slate-100">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Valuation</p>
      <div className="flex items-center gap-1 text-sm text-slate-700">
        <span className="text-xs text-slate-400 mr-1">Pre-Money:</span>
        <EditableNumber
          value={pre || null}
          onSave={save}
          placeholder="Set pre-money"
          className="font-semibold text-slate-800"
        />
      </div>
      {pre > 0 && target > 0 && (
        <>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-xs text-slate-400 mr-1">Post-Money:</span>
            <span className="font-semibold text-violet-700">{fmt(post)}</span>
            <span className="text-[10px] text-slate-400">(pre + raise target)</span>
          </div>
        </>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function RaiseOverview({ settings, investors = [] }) {
  const queryClient = useQueryClient();
  const target = settings.target_raise_amount || 0;
  const committed = settings.capital_committed || 0;
  const soft = settings.soft_commitments || 0;

  if (!target) return null;

  const remaining = Math.max(0, target - committed);
  const progressPercent = target > 0 ? Math.min(100, (committed / target) * 100) : 0;
  const totalWithSoft = committed + soft;
  const totalPercent = target > 0 ? Math.min(100, (totalWithSoft / target) * 100) : 0;
  const daysLeft = daysUntil(settings.target_close_date);

  return (
    <div className="glass rounded-xl p-6 mb-8 border-2 border-violet-200 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />

      <div className="relative">
        {/* Header label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-600/70 font-medium">Raise Command Layer</span>
        </div>

        {/* ── 1. Round Badge + Countdown ── */}
        <RoundBadgeRow settings={settings} daysLeft={daysLeft} />

        {/* ── 3. Weekly Momentum ── */}
        <WeeklyMomentum investors={investors} />

        {/* Metrics Grid — unchanged */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 metric-glow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-medium">Target</p>
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">{fmt(target)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-emerald-200 metric-glow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-600 font-medium">Committed</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-700 tracking-tight">{fmt(committed)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-amber-200 metric-glow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-amber-600 font-medium">Soft Commits</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700 tracking-tight">{fmt(soft)}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 metric-glow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-medium">Remaining</p>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <div className="w-4 h-4 rounded border-2 border-slate-300" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">{fmt(remaining)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary-foreground">Round Progress</span>
            <span className="text-violet-600 font-semibold">{progressPercent.toFixed(1)}% committed</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-violet-200 transition-all duration-500" style={{ width: `${totalPercent}%` }} />
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-violet-500 transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{fmt(committed)} / {fmt(target)}</span>
            {soft > 0 && <span className="text-amber-600">+{fmt(soft)} soft</span>}
          </div>
        </div>

        {/* ── 4. Pace Indicator ── */}
        <PaceIndicator committed={committed} target={target} daysLeft={daysLeft} />

        {/* ── 5. Valuation Fields ── */}
        <ValuationRow settings={settings} companyId={settings.id} queryClient={queryClient} />
      </div>
    </div>
  );
}