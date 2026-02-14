import React from "react";
import { AlertCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const cadenceColors = {
  "Overdue": "border-red-200 bg-red-50",
  "Upcoming": "border-amber-200 bg-amber-50",
};

const cadenceDotColors = {
  "Overdue": "bg-red-500",
  "Upcoming": "bg-amber-500",
};

export default function ActionRequired({ investors }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const actionsNeeded = investors
    .filter((inv) => {
      if (!inv.next_action_date) return false;
      if (inv.cadence_status === "Closed") return false;
      return true;
    })
    .map((inv) => {
      const actionDate = new Date(inv.next_action_date);
      actionDate.setHours(0, 0, 0, 0);
      
      const urgency = actionDate < today ? "Overdue" : actionDate <= threeDaysFromNow ? "Upcoming" : null;
      
      return { ...inv, actionDate, urgency };
    })
    .filter((inv) => inv.urgency)
    .sort((a, b) => a.actionDate - b.actionDate);

  if (actionsNeeded.length === 0) {
    return null;
  }

  const formatDate = (date) => {
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) {
      return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} overdue`;
    }
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  return (
    <div className="glass rounded-xl p-6 border-l-4 border-amber-500 mb-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Action Required</h2>
            <p className="text-slate-500 text-xs mt-0.5">{actionsNeeded.length} investor{actionsNeeded.length === 1 ? '' : 's'} need follow-up</p>
          </div>
        </div>
        <Link
          to={createPageUrl("Investors")}
          className="text-xs text-violet-600 hover:text-violet-700 transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-2">
        {actionsNeeded.map((inv) => (
          <Link
            key={inv.id}
            to={createPageUrl("Investors")}
            className={`block rounded-lg p-4 border transition-all hover:border-violet-300 ${cadenceColors[inv.urgency]}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${cadenceDotColors[inv.urgency]}`} />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-slate-800 font-medium text-sm">{inv.name}</p>
                    {inv.firm && (
                      <span className="text-slate-500 text-xs">• {inv.firm}</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs mt-1">{inv.next_action_type || "Follow-up needed"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-medium ${inv.urgency === 'Overdue' ? 'text-red-600' : 'text-amber-600'}`}>
                  {formatDate(inv.actionDate)}
                </p>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  {inv.actionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}