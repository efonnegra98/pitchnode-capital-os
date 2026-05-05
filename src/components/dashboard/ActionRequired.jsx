import React from "react";
import { AlertCircle, Clock, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const THIS_WEEK_DAYS = 7;

function daysBetween(a, b) {
  return Math.floor((a - b) / (1000 * 60 * 60 * 24));
}

function formatOverdue(days) {
  if (days === 1) return "1 day overdue";
  return `${days} days overdue`;
}

function formatDue(date, today) {
  const diff = daysBetween(date, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

function Section({ label, icon: Icon, color, children, count }) {
  if (!count) return null;
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${color}`}>{label}</span>
        <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-1 bg-slate-100 text-slate-500">{count}</span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function InvestorRow({ inv, badge, badgeColor }) {
  return (
    <Link
      to={createPageUrl("Investors")}
      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 bg-white dark:bg-[#2a2a2a] dark:border-slate-700 dark:hover:border-violet-500 dark:hover:bg-violet-950/30 transition-all group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-slate-800 dark:text-white truncate">{inv.name || inv.firm || "Unnamed"}</span>
          {inv.firm && inv.name && <span className="text-xs text-slate-400 dark:text-[#888888] truncate">{inv.firm}</span>}
        </div>
        {inv.next_action_type && (
          <p className="text-[11px] text-slate-400 dark:text-[#888888] mt-0.5 truncate">{inv.next_action_type}</p>
        )}
      </div>
      <span className={`text-[10px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-full border ${badgeColor}`}>
        {badge}
      </span>
    </Link>
  );
}

export default function ActionRequired({ investors }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + THIS_WEEK_DAYS);

  const active = investors.filter(i => i.cadence_status !== "Closed" && i.status !== "Passed");

  // Only investors WITH a next_action_date are shown here
  // 1. Overdue: next_action_date is in the past
  const overdue = active.filter(i => {
    if (!i.next_action_date) return false;
    const d = new Date(i.next_action_date); d.setHours(0, 0, 0, 0);
    return d < today;
  }).sort((a, b) => new Date(a.next_action_date) - new Date(b.next_action_date));

  // 2. Due Today
  const dueToday = active.filter(i => {
    if (!i.next_action_date) return false;
    const d = new Date(i.next_action_date); d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  // 3. Due This Week (after today, within 7 days)
  const dueThisWeek = active.filter(i => {
    if (!i.next_action_date) return false;
    const d = new Date(i.next_action_date); d.setHours(0, 0, 0, 0);
    return d > today && d <= weekEnd;
  }).sort((a, b) => new Date(a.next_action_date) - new Date(b.next_action_date));

  const totalItems = overdue.length + dueToday.length + dueThisWeek.length;
  const hasInvestors = active.length > 0;

  // No scheduled actions, but investors exist in pipeline
  if (totalItems === 0 && hasInvestors) {
    return (
      <div className="glass rounded-xl p-5 border border-slate-100 bg-slate-50/50 dark:bg-[#1e1e1e] dark:border-slate-800 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-white mb-1">Pipeline Ready</p>
        <p className="text-xs text-slate-400 dark:text-[#888888] mb-3 max-w-xs mx-auto">
          Your investor list has been imported. Begin outreach to activate your pipeline.
        </p>
        <Link
          to={createPageUrl("Investors")}
          className="inline-block text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors border border-violet-200 rounded-lg px-3 py-1.5 hover:bg-violet-50"
        >
          View Investors →
        </Link>
      </div>
    );
  }

  // No investors at all
  if (totalItems === 0) {
    return (
      <div className="glass rounded-xl p-4 flex items-center gap-3 border border-green-100 bg-green-50/40">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <p className="text-sm text-slate-600">No actions required — follow-ups are on track.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5 border border-slate-200 dark:bg-[#1e1e1e] dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${overdue.length > 0 ? "text-red-500" : "text-amber-500"}`} />
          <span className="text-sm font-semibold text-slate-700 dark:text-white">
            {overdue.length > 0 ? `${overdue.length} overdue` : `${totalItems} upcoming follow-up${totalItems !== 1 ? "s" : ""}`}
          </span>
        </div>
        <Link to={createPageUrl("Investors")} className="text-xs text-violet-600 hover:text-violet-700 transition-colors">
          Manage All →
        </Link>
      </div>

      <Section label="Overdue" icon={AlertCircle} color="text-red-500" count={overdue.length}>
        {overdue.map(inv => {
          const d = new Date(inv.next_action_date); d.setHours(0, 0, 0, 0);
          const days = daysBetween(today, d);
          return (
            <InvestorRow key={inv.id} inv={inv} badge={formatOverdue(days)} badgeColor="border-red-200 bg-red-50 text-red-600" />
          );
        })}
      </Section>

      <Section label="Due Today" icon={CalendarClock} color="text-amber-600" count={dueToday.length}>
        {dueToday.map(inv => (
          <InvestorRow key={inv.id} inv={inv} badge="Today" badgeColor="border-amber-200 bg-amber-50 text-amber-700" />
        ))}
      </Section>

      <Section label="Due This Week" icon={Clock} color="text-blue-500" count={dueThisWeek.length}>
        {dueThisWeek.map(inv => {
          const d = new Date(inv.next_action_date); d.setHours(0, 0, 0, 0);
          return (
            <InvestorRow key={inv.id} inv={inv} badge={formatDue(d, today)} badgeColor="border-blue-200 bg-blue-50 text-blue-600" />
          );
        })}
      </Section>
    </div>
  );
}