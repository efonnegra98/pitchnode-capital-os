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
      className="flex items-start gap-4 px-4 py-4 bg-card active:bg-accent transition-colors cursor-pointer"
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-bold mt-0.5 ${colorClass}`}>
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Firm name + chevron */}
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-foreground text-[15px] truncate">
            {investor.firm || <span className="italic text-muted-foreground">No firm name</span>}
          </p>
          <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Row 2: Contact name */}
        {investor.name && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{investor.name}</p>
        )}

        {/* Row 3: Funnel stage badge */}
        {investor.funnel_stage && (
          <div className="mt-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${funnelClass}`}>
              {investor.funnel_stage}
            </span>
          </div>
        )}

        {/* Row 4: Smart next action */}
        <div className="mt-2">
          <SmartNextAction investor={investor} variant="inline" />
        </div>
      </div>
    </div>
  );
}