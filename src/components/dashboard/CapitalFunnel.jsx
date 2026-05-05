import React, { useState } from "react";
import { AlertTriangle, Clock, Send } from "lucide-react";

const PIPELINE_STAGES = [
  "Identified",
  "Researching",
  "Outreach Sent",
  "Intro Call Scheduled",
  "Intro Call Complete",
  "Interest Confirmed",
  "Diligence",
  "Term Sheet",
  "Closed Won",
  "Closed Lost",
  "Pass",
];

const STAGE_STYLE = {
  "Identified":            { bar: "bg-slate-300",     text: "text-slate-600",   label: "bg-slate-100 text-slate-600" },
  "Researching":           { bar: "bg-slate-400",     text: "text-slate-600",   label: "bg-slate-100 text-slate-700" },
  "Outreach Sent":         { bar: "bg-blue-300",      text: "text-blue-700",    label: "bg-blue-50 text-blue-700" },
  "Intro Call Scheduled":  { bar: "bg-blue-400",      text: "text-blue-700",    label: "bg-blue-50 text-blue-700" },
  "Intro Call Complete":   { bar: "bg-blue-500",      text: "text-blue-700",    label: "bg-blue-50 text-blue-800" },
  "Interest Confirmed":    { bar: "bg-violet-500",    text: "text-violet-700",  label: "bg-violet-50 text-violet-700" },
  "Diligence":             { bar: "bg-amber-500",     text: "text-amber-700",   label: "bg-amber-50 text-amber-700" },
  "Term Sheet":            { bar: "bg-emerald-400",   text: "text-emerald-700", label: "bg-emerald-50 text-emerald-700" },
  "Closed Won":            { bar: "bg-emerald-600",   text: "text-emerald-700", label: "bg-emerald-100 text-emerald-800" },
  "Closed Lost":           { bar: "bg-red-400",       text: "text-red-600",     label: "bg-red-50 text-red-600" },
  "Pass":                  { bar: "bg-slate-300",     text: "text-slate-500",   label: "bg-slate-100 text-slate-500" },
};

const SENTIMENT_STYLE = {
  Champion:  { bar: "bg-emerald-500", text: "text-emerald-700" },
  Positive:  { bar: "bg-blue-500",    text: "text-blue-700" },
  Curious:   { bar: "bg-indigo-400",  text: "text-indigo-700" },
  Neutral:   { bar: "bg-slate-400",   text: "text-slate-600" },
  Skeptical: { bar: "bg-amber-500",   text: "text-amber-700" },
};

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

export default function CapitalFunnel({ investors, onFollowUp }) {
  const [showAllOverdue, setShowAllOverdue] = useState(false);

  if (!investors || investors.length === 0) {
    return (
      <div className="glass dark:bg-[#1a1a1a] rounded-xl p-6 border border-border dark:border-[#2a2a2a] flex flex-col items-center justify-center min-h-[180px] text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-white mb-1">No investor data yet</p>
        <p className="text-xs text-slate-400 dark:text-[#888888] mb-4">Add investors to see funnel analytics</p>
        <a href="/Investors" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 transition-all">
          + Add Investor
        </a>
      </div>
    );
  }

  // Stage counts
  const stageCounts = {};
  PIPELINE_STAGES.forEach(s => { stageCounts[s] = 0; });
  investors.forEach(inv => {
    const s = inv.funnel_stage;
    if (s && stageCounts[s] !== undefined) stageCounts[s]++;
  });

  // Core metrics
  const total = investors.length;
  const closedStages = ["Closed Won", "Closed Lost", "Pass"];
  const activeCount = investors.filter(i => !closedStages.includes(i.funnel_stage)).length;

  const overdueInvestors = investors.filter(inv => {
    const days = daysSince(inv.last_contact_date);
    const activityDays = inv.activity_log?.length
      ? daysSince(inv.activity_log[inv.activity_log.length - 1]?.timestamp)
      : null;
    const staleDays = Math.min(days ?? 999, activityDays ?? 999);
    return staleDays >= 21 && !closedStages.includes(inv.funnel_stage);
  });

  const identified = stageCounts["Identified"] || 0;
  const interestConfirmed = stageCounts["Interest Confirmed"] || 0;
  const topConversion = identified > 0 ? Math.round((interestConfirmed / identified) * 100) : 0;

  // Funnel bar max (exclude closed)
  const activeStageCounts = PIPELINE_STAGES.slice(0, 9).map(s => stageCounts[s]);
  const maxCount = Math.max(...activeStageCounts, 1);

  // Sentiment
  const sentiments = ["Champion", "Positive", "Curious", "Neutral", "Skeptical"];
  const sentimentCounts = sentiments.map(s => ({
    s,
    count: investors.filter(i => i.sentiment === s).length,
  }));
  const totalSentiment = sentimentCounts.reduce((a, b) => a + b.count, 0);

  // Velocity: avg days per stage from activity_log
  const stageVelocity = PIPELINE_STAGES.slice(0, 9).map(stage => {
    const inStage = investors.filter(i => i.funnel_stage === stage && i.activity_log?.length > 0);
    if (inStage.length === 0) return { stage, avg: null };
    const avgDays = inStage.reduce((sum, inv) => {
      const latest = inv.activity_log[inv.activity_log.length - 1]?.timestamp;
      const d = latest ? daysSince(latest) : 0;
      return sum + d;
    }, 0) / inStage.length;
    return { stage, avg: Math.round(avgDays) };
  }).filter(v => v.avg !== null && v.avg > 0);

  const stalledStage = stageVelocity.length > 0
    ? stageVelocity.reduce((a, b) => (b.avg > a.avg ? b : a))
    : null;

  const visibleOverdue = showAllOverdue ? overdueInvestors : overdueInvestors.slice(0, 3);

  return (
    <div className="space-y-4">

      {/* ── 1. KEY METRICS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Tracked", value: total, color: "text-slate-800 dark:text-white" },
          { label: "Active in Pipeline", value: activeCount, color: "text-blue-700 dark:text-white" },
          { label: "Overdue Follow-up", value: overdueInvestors.length, color: overdueInvestors.length > 0 ? "text-red-600 dark:text-white" : "text-slate-800 dark:text-white" },
          { label: "ID → Interest Conv.", value: `${topConversion}%`, color: "text-violet-700 dark:text-white" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass dark:bg-[#1a1a1a] rounded-xl p-4 border border-slate-200 dark:border-[#2a2a2a]">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-[#888888] uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── 2. FUNNEL VISUALIZATION ── */}
      <div className="glass dark:bg-[#1a1a1a] rounded-xl p-5 border border-slate-200 dark:border-[#2a2a2a]">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-[#888888] uppercase tracking-widest mb-4">Pipeline Funnel</p>
        <div className="space-y-1.5">
          {PIPELINE_STAGES.map((stage, idx) => {
            const count = stageCounts[stage] || 0;
            const isClosedGroup = closedStages.includes(stage);
            const barWidth = isClosedGroup
              ? (count / Math.max(total, 1)) * 100
              : (count / maxCount) * 100;
            const style = STAGE_STYLE[stage];

            // Conversion rate to NEXT stage (skip closed group)
            const nextStage = !isClosedGroup && idx < PIPELINE_STAGES.indexOf("Closed Won") - 1
              ? PIPELINE_STAGES[idx + 1]
              : null;
            const nextCount = nextStage ? (stageCounts[nextStage] || 0) : null;
            const convRate = nextCount !== null && count > 0
              ? Math.round((nextCount / count) * 100)
              : null;

            return (
              <div key={stage}>
                {/* Divider before closed stages */}
                {stage === "Closed Won" && (
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-[#888888] uppercase tracking-wider">Closed</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-[148px] flex-shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded text-white dark:text-white bg-slate-700 dark:bg-slate-600`}>
                      {stage}
                    </span>
                  </div>
                  <div className="flex-1 h-5 bg-slate-100 dark:bg-[#2a2a2a] rounded-md overflow-hidden relative">
                    <div
                      className={`h-full ${style.bar} rounded-md transition-all duration-500`}
                      style={{ width: `${Math.max(barWidth, count > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                  <div className="w-6 text-right text-sm font-bold text-slate-700 dark:text-white flex-shrink-0">{count}</div>
                </div>
                {/* Conversion rate between stages */}
                {convRate !== null && count > 0 && (
                  <div className="flex items-center gap-1 pl-[164px] py-0.5">
                    <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 ml-1" />
                    <span className={`text-[10px] font-medium ${convRate >= 50 ? "text-emerald-600" : convRate >= 25 ? "text-amber-500" : "text-red-500"} dark:text-[#888888]`}>
                      {convRate}% → {nextStage}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. SENTIMENT BREAKDOWN ── */}
      {totalSentiment > 0 && (
        <div className="glass dark:bg-[#1a1a1a] rounded-xl p-5 border border-slate-200 dark:border-[#2a2a2a]">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-[#888888] uppercase tracking-widest mb-3">Sentiment Breakdown</p>
          <div className="flex h-4 rounded-full overflow-hidden gap-px">
            {sentimentCounts.map(({ s, count }) => {
              const pct = totalSentiment > 0 ? (count / totalSentiment) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={s}
                  className={`${SENTIMENT_STYLE[s].bar} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                  title={`${s}: ${count}`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {sentimentCounts.map(({ s, count }) => count > 0 && (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${SENTIMENT_STYLE[s].bar}`} />
                <span className={`text-[11px] font-medium text-white dark:text-white`}>{s}</span>
                <span className="text-[11px] text-slate-400 dark:text-[#888888]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. VELOCITY INSIGHT ── */}
      {stageVelocity.length > 0 && (
        <div className="glass dark:bg-[#1a1a1a] rounded-xl p-5 border border-slate-200 dark:border-[#2a2a2a]">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-[#888888] uppercase tracking-widest mb-3">Pipeline Velocity</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {stageVelocity.map(({ stage, avg }) => (
              <div key={stage} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                stage === stalledStage?.stage
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                  : "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-[#888888]"
              }`}>
                <Clock className="w-3 h-3" />
                <span>{stage}</span>
                <span className="font-bold">{avg}d</span>
              </div>
            ))}
          </div>
          {stalledStage && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-700 dark:text-amber-400">
                <span className="font-semibold">Investors are stalling at {stalledStage.stage}</span> — avg {stalledStage.avg} days. Consider sending follow-up materials or scheduling a check-in.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 5. OVERDUE ALERTS ── */}
      {overdueInvestors.length > 0 && (
        <div className="glass dark:bg-[#1a1a1a] rounded-xl p-5 border border-red-100 dark:border-red-950/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-widest">Overdue — No Activity 21+ Days</p>
            </div>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-full px-2 py-0.5">
              {overdueInvestors.length}
            </span>
          </div>
          <div className="space-y-2">
            {visibleOverdue.map(inv => {
              const days = daysSince(inv.last_contact_date) ?? "—";
              const actDays = inv.activity_log?.length
                ? daysSince(inv.activity_log[inv.activity_log.length - 1]?.timestamp)
                : null;
              const staleDays = Math.min(
                typeof days === "number" ? days : 999,
                actDays ?? 999
              );
              return (
                <div key={inv.id} className="flex items-center justify-between bg-white dark:bg-slate-900/40 border border-red-100 dark:border-red-950/50 rounded-lg px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">{inv.firm || inv.name || "Unnamed"}</span>
                      {inv.name && inv.firm && <span className="text-xs text-slate-400 dark:text-[#888888]">{inv.name}</span>}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STAGE_STYLE[inv.funnel_stage]?.label || "bg-slate-100 text-slate-500"}`}>
                        {inv.funnel_stage || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400">{staleDays === 999 ? "Never" : `${staleDays}d`}</span>
                    {onFollowUp && (
                      <button
                        onClick={() => onFollowUp(inv)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-950/50 border border-violet-200 dark:border-violet-900 rounded-md px-2.5 py-1 transition-colors"
                      >
                        <Send className="w-3 h-3" /> Log
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {overdueInvestors.length > 3 && (
            <button
              onClick={() => setShowAllOverdue(v => !v)}
              className="mt-2 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium transition-colors"
            >
              {showAllOverdue ? "Show less" : `Show ${overdueInvestors.length - 3} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}