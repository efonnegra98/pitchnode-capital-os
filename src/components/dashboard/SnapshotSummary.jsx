import React from "react";
import { Calendar } from "lucide-react";

export default function SnapshotSummary({ latestUpdate, investorCount }) {
  if (!latestUpdate) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Snapshot</h3>
        <p className="text-secondary-foreground text-sm">No updates created yet. Build your first investor update to see a summary.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Snapshot</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-1 h-full min-h-[40px] rounded-full bg-gradient-to-b from-violet-500 to-transparent" />
          <div>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/90 mb-1">Latest Update</p>
            <p className="text-foreground dark:text-slate-50 font-medium text-sm">{latestUpdate.month}</p>
            {latestUpdate.highlights && (
              <p className="text-secondary-foreground text-xs mt-1 line-clamp-2">{latestUpdate.highlights}</p>
            )}
          </div>
        </div>

        {latestUpdate.sent_date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Sent {new Date(latestUpdate.sent_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <div className="flex justify-between text-xs">
            <span className="text-secondary-foreground">Active Investors</span>
            <span className="text-violet-600 dark:text-violet-400 font-semibold">{investorCount}</span>
          </div>
        </div>

        {latestUpdate.key_wins && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/90 mb-1">Key Wins</p>
            <p className="text-foreground dark:text-slate-200 text-xs line-clamp-3">{latestUpdate.key_wins}</p>
          </div>
        )}
      </div>
    </div>
  );
}