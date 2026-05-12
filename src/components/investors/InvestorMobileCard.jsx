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

const statusBadge = {
  "Warm":      { label: "Warm",   cls: "bg-amber-100 text-amber-700" },
  "Engaged":   { label: "Active", cls: "bg-emerald-100 text-emerald-700" },
  "Committed": { label: "Active", cls: "bg-emerald-100 text-emerald-700" },
  "Passed":    { label: "Cold",   cls: "bg-slate-100 text-slate-500" },
};

const BADGE_STYLES = {
  Active:  { background: "#d1fae5", color: "#065f46" },
  Warm:    { background: "#fef3c7", color: "#92400e" },
  Cold:    { background: "#f3f4f6", color: "#6b7280" },
  Overdue: { background: "#fee2e2", color: "#991b1b" },
};

function getStatusBadge(investor) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSince = investor.last_contact_date
    ? Math.floor((today - new Date(investor.last_contact_date)) / 86400000)
    : 999;

  if (["Closed Won", "Committed"].includes(investor.funnel_stage)) {
    return { label: "Active", style: BADGE_STYLES.Active };
  }
  if (["Closed Lost", "Pass", "Passed"].includes(investor.funnel_stage)) {
    return { label: "Cold", style: BADGE_STYLES.Cold };
  }
  if (investor.sentiment === "Champion" || investor.sentiment === "Positive" || investor.status === "Engaged") {
    return { label: "Warm", style: BADGE_STYLES.Warm };
  }
  if (daysSince >= 21 || investor.sentiment === "Skeptical") {
    return { label: "Cold", style: BADGE_STYLES.Cold };
  }
  if (daysSince < 14) {
    return { label: "Active", style: BADGE_STYLES.Active };
  }
  return { label: "Warm", style: BADGE_STYLES.Warm };
}

function formatLastContact(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const today = new Date();
  const days = Math.floor((today - d) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function InvestorMobileCard({ investor, onClick }) {
  const initials = investor.firm?.trim()?.[0]?.toUpperCase() || investor.name?.trim()?.[0]?.toUpperCase() || "?";
  const colorClass = getAvatarColor(investor.firm || investor.name);
  const funnelClass = funnelColors[investor.funnel_stage] || "bg-slate-100 text-slate-600";
  const badge = getStatusBadge(investor);
  const lastContact = formatLastContact(investor.last_contact_date);

  return (
    <div
      onClick={() => onClick(investor)}
      className="flex items-start gap-4 px-4 py-4 bg-card active:bg-accent transition-colors cursor-pointer w-full [&:not(:last-child)]:border-b"
      style={{ borderColor: "var(--card-divider)" }}
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-bold mt-0.5 ${colorClass}`}>
        {initials}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Firm name */}
        <p className="font-bold text-foreground text-[16px] truncate pr-2">
          {investor.firm || <span className="italic text-muted-foreground">No firm name</span>}
        </p>

        {/* Row 2: Contact name */}
        {investor.name && (
          <p className="truncate mt-1" style={{ fontSize: "13px", color: "#888888" }}>{investor.name}</p>
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

      {/* Right side: status badge + last contact */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={badge.style}>
          {badge.label}
        </span>
        {lastContact && (
          <span style={{ fontSize: "11px", color: "#aaaaaa" }}>{lastContact}</span>
        )}
      </div>
    </div>
  );
}