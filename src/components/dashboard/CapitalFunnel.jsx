import React from "react";
import { TrendingDown } from "lucide-react";

export default function CapitalFunnel({ investors }) {
  // Calculate funnel metrics
  const stages = [
    { key: "identified", label: "Identified", filter: (inv) => inv.funnel_stage === "Identified" || inv.status !== "Passed" },
    { key: "contacted", label: "Contacted", filter: (inv) => inv.funnel_stage && inv.funnel_stage !== "Identified" && inv.status !== "Passed" },
    { key: "intro", label: "Intro Calls", filter: (inv) => ["Intro Call", "Partner Meeting", "Due Diligence", "Term Sheet"].includes(inv.funnel_stage) && inv.status !== "Passed" },
    { key: "partner", label: "Partner Meetings", filter: (inv) => ["Partner Meeting", "Due Diligence", "Term Sheet"].includes(inv.funnel_stage) && inv.status !== "Passed" },
    { key: "soft", label: "Soft Commits", filter: (inv) => inv.relationship_strength === "Champion" && inv.status === "Engaged" },
    { key: "hard", label: "Hard Commits", filter: (inv) => inv.status === "Committed" },
    { key: "passed", label: "Passed", filter: (inv) => inv.status === "Passed" },
  ];

  const counts = stages.map((stage) => ({
    ...stage,
    count: investors.filter(stage.filter).length,
  }));

  const totalIdentified = counts[0].count;
  const hardCommits = counts[5].count;
  const introCalls = counts[2].count;
  const partnerMeetings = counts[3].count;

  const conversionToCommitment = totalIdentified > 0 ? ((hardCommits / totalIdentified) * 100).toFixed(1) : 0;
  const meetingToPartnerConversion = introCalls > 0 ? ((partnerMeetings / introCalls) * 100).toFixed(1) : 0;

  const maxCount = Math.max(...counts.slice(0, 6).map(c => c.count), 1);

  if (!investors || investors.length === 0) {
    return (
      <div className="glass rounded-xl p-6 border border-border flex flex-col items-center justify-center min-h-[220px] text-center">
        <p className="text-sm font-semibold text-slate-700 mb-1">No investor data yet</p>
        <p className="text-xs text-slate-400 mb-4 max-w-xs">Add your first investor to start tracking your raise pipeline</p>
        <a
          href="/Investors"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all"
        >
          + Add Investor
        </a>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Capital Funnel Analytics</h2>
          <p className="text-muted-foreground dark:text-muted-foreground/90 text-xs mt-1">Raise pipeline conversion metrics</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/90">Conversion to Commit</p>
            <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{conversionToCommitment}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/90">Meeting → Partner</p>
            <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{meetingToPartnerConversion}%</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {counts.slice(0, 6).map((stage, idx) => {
          const nextStage = counts[idx + 1];
          const dropoffPercent = nextStage && stage.count > 0
            ? (((stage.count - nextStage.count) / stage.count) * 100).toFixed(0)
            : null;
          const widthPercent = (stage.count / maxCount) * 100;

          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-foreground dark:text-slate-200 font-medium">{stage.label}</span>
                <div className="flex items-center gap-3">
                  {dropoffPercent && dropoffPercent > 0 && (
                    <span className="text-[10px] text-red-500/70 dark:text-red-400/70 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {dropoffPercent}%
                    </span>
                  )}
                  <span className="text-sm font-bold text-foreground dark:text-slate-50 w-8 text-right">{stage.count}</span>
                </div>
              </div>
              <div className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg overflow-hidden relative border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500 transition-all duration-500 flex items-center justify-end pr-3"
                  style={{ width: `${widthPercent}%` }}
                >
                  {stage.count > 0 && (
                    <span className="text-[10px] font-semibold text-white/90">
                      {((stage.count / totalIdentified) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Passed - shown separately */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground font-medium">{counts[6].label}</span>
            <span className="text-sm font-bold text-muted-foreground w-8 text-right">{counts[6].count}</span>
          </div>
          <div className="h-6 bg-slate-100 dark:bg-slate-800/30 rounded-lg overflow-hidden relative border border-slate-200 dark:border-slate-700">
            <div
              className="h-full bg-slate-200 dark:bg-slate-600 transition-all duration-500"
              style={{ width: `${(counts[6].count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}