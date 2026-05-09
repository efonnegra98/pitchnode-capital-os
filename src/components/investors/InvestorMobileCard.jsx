import React from "react";
import SmartNextAction from "./SmartNextAction";

const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

function getAvatarColor(str) {
  const s = str || "?";
  return avatarColors[s.charCodeAt(0) % avatarColors.length];
}

const funnelColors = {
  "Identified": "bg-slate-100 text-slate-600",
  "Researching": "bg-blue-50 text-blue-600",
  "Outreach Sent": "bg-amber-50 text-amber-600",
  "Intro Call Scheduled": "bg-violet-50 text-violet-600",
  "Intro Call Complete": "bg-violet-100 text-violet-700",
  "Interest Confirmed": "bg-indigo-50 text-indigo-700",
  "Diligence": "bg-orange-50 text-orange-700",
  "Term Sheet": "bg-emerald-50 text-emerald-700",
  "Closed Won": "bg-emerald-100 text-emerald-800",
  "Closed Lost": "bg-red-50 text-red-600",
  "Pass": "bg-slate-100 text-slate-500",
};

export default function InvestorMobileCard({ investor, onClick }) {
  const initials = investor.firm?.trim()?.[0]?.toUpperCase() || investor.name?.trim()?.[0]?.toUpperCase() || "?";
  const colorClass = getAvatarColor(investor.firm || investor.name);
  const funnelClass = funnelColors[investor.funnel_stage] || "bg-slate-100 text-slate-600";

  return (
    <div
      onClick={() => onClick(investor)}
      className="flex items-center gap-3 px-4 py-4 bg-card border-b border-border active:bg-accent transition-colors min-h-[80px] cursor-pointer"
    >
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-base font-bold ${colorClass}`}>
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-foreground text-sm truncate">
            {investor.firm || <span className="italic text-muted-foreground">No firm name</span>}
          </p>
          {investor.funnel_stage && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${funnelClass}`}>
              {investor.funnel_stage}
            </span>
          )}
        </div>
        {investor.name && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{investor.name}</p>
        )}
        <div className="mt-1">
          <SmartNextAction investor={investor} variant="inline" />
        </div>
      </div>

      {/* Chevron */}
      <div className="text-muted-foreground flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}