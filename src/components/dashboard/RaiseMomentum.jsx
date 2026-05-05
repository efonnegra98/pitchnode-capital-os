import React from "react";
import { TrendingUp, AlertTriangle, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const STALE_DAYS = 14;
const NO_OUTREACH_DAYS = 21;

export default function RaiseMomentum({ investors }) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const active = investors.filter(i => i.status !== "Passed" && i.cadence_status !== "Closed");

  const recentFollowUps = active.filter(i => {
    if (!i.last_contact_date) return false;
    const d = new Date(i.last_contact_date);
    return (now - d) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  const staleCount = active.filter(i => {
    if (!i.last_contact_date) return true; // no contact = stale
    const days = (now - new Date(i.last_contact_date)) / (1000 * 60 * 60 * 24);
    return days >= STALE_DAYS;
  }).length;

  // Find last outreach date across all active investors
  const lastOutreachDate = active.reduce((latest, i) => {
    if (!i.last_contact_date) return latest;
    const d = new Date(i.last_contact_date);
    return !latest || d > latest ? d : latest;
  }, null);

  const daysSinceOutreach = lastOutreachDate
    ? Math.floor((now - lastOutreachDate) / (1000 * 60 * 60 * 24))
    : null;

  const noRecentOutreach = daysSinceOutreach === null || daysSinceOutreach >= NO_OUTREACH_DAYS;

  // Determine status
  let status, label, sub, Icon, dot, bg, text, border;

  if (active.length === 0) {
    status = "neutral";
    label = "No Investors";
    sub = "Add investors to track momentum";
    Icon = Minus;
    dot = "bg-slate-300";
    bg = "bg-slate-50";
    text = "text-slate-500";
    border = "border-slate-200";
  } else if (noRecentOutreach) {
    status = "red";
    label = "At Risk";
    sub = daysSinceOutreach !== null
      ? `No outreach in ${daysSinceOutreach} days`
      : "No outreach recorded";
    Icon = AlertTriangle;
    dot = "bg-red-500";
    bg = "bg-red-50";
    text = "text-red-700";
    border = "border-red-200";
  } else if (staleCount >= 3) {
    status = "yellow";
    label = "Slowing";
    sub = `${staleCount} investor${staleCount !== 1 ? "s" : ""} stale (${STALE_DAYS}+ days)`;
    Icon = AlertTriangle;
    dot = "bg-amber-400";
    bg = "bg-amber-50";
    text = "text-amber-700";
    border = "border-amber-200";
  } else {
    status = "green";
    label = "On Track";
    sub = `${recentFollowUps} follow-up${recentFollowUps !== 1 ? "s" : ""} in the last 7 days`;
    Icon = TrendingUp;
    dot = "bg-emerald-500";
    bg = "bg-emerald-50";
    text = "text-emerald-700";
    border = "border-emerald-200";
  }

  const darkBg = status === "neutral" ? "dark:bg-[#1e1e1e]" : "dark:bg-[#1e1e1e]";
  const darkBorder = "dark:border-slate-800";
  const darkText = status === "neutral" ? "dark:text-[#888888]" : `dark:text-${status === "red" ? "[#ff6b6b]" : status === "yellow" ? "[#ffa94d]" : "[#51cf66]"}`;

  return (
    <div className={`rounded-xl border ${border} ${bg} ${darkBg} ${darkBorder} px-4 py-3 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
        <div>
          <p className={`text-sm font-semibold ${text} ${darkText}`}>
            Momentum: {label}
          </p>
          <p className={`text-xs mt-0.5 ${text} ${darkText} opacity-80`}>{sub}</p>
        </div>
      </div>
      {status !== "neutral" && (
        <Link
          to={createPageUrl("Investors")}
          className={`text-[11px] font-medium ${text} ${darkText} opacity-80 hover:opacity-100 whitespace-nowrap transition-opacity`}
        >
          View →
        </Link>
      )}
    </div>
  );
}