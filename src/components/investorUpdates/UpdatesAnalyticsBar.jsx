import React from "react";
import { Send, BarChart2, Clock, AlertTriangle } from "lucide-react";

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export default function UpdatesAnalyticsBar({ updates }) {
  const sent = updates.filter((u) => u.status === "sent");
  const totalSent = sent.length;

  const avgOpenRate = totalSent > 0
    ? Math.round(sent.reduce((acc, u) => {
        const rate = u.recipients_count > 0 ? (u.opened_count || 0) / u.recipients_count * 100 : 0;
        return acc + rate;
      }, 0) / totalSent)
    : null;

  const lastSent = sent.sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date))[0];
  const daysSinceLast = lastSent ? daysSince(lastSent.sent_date) : null;
  const isStale = daysSinceLast === null || daysSinceLast >= 30;

  return (
    <div className="space-y-3 mb-6">
      {isStale && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            {daysSinceLast === null
              ? "You haven't sent any investor updates yet — investors value consistent communication."
              : `You haven't sent an investor update in ${daysSinceLast} days — investors value consistent communication.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-violet-500" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Total Sent</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalSent}</p>
        </div>

        <div className="bg-background border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Avg Open Rate</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{avgOpenRate !== null ? `${avgOpenRate}%` : "—"}</p>
        </div>

        <div className="bg-background border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Last Sent</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {daysSinceLast !== null ? `${daysSinceLast}d` : "—"}
          </p>
          {lastSent?.sent_date && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(lastSent.sent_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}