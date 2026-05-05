import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function OpenRatePanel({ update, investors }) {
  if (!update || update.status !== "sent" || !update.recipients_count) return null;

  const recipientInvestors = investors.filter(i => (update.recipient_ids || []).includes(i.id));
  const openedIds = update.opened_investor_ids || [];
  const total = update.recipients_count || recipientInvestors.length;
  const opened = update.opened_count || openedIds.length;
  const rate = total > 0 ? Math.round((opened / total) * 100) : 0;

  return (
    <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Open Rate</p>
        <span className="text-sm font-bold text-violet-700">{opened}/{total} opened ({rate}%)</span>
      </div>
      <div className="p-4">
        <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all" style={{ width: `${rate}%` }} />
        </div>
        {recipientInvestors.length > 0 && (
          <div className="space-y-1.5">
            {recipientInvestors.map(inv => {
              const didOpen = openedIds.includes(inv.id);
              return (
                <div key={inv.id} className="flex items-center gap-2.5 py-1.5">
                  {didOpen
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  }
                  <span className="text-sm text-slate-700">{inv.firm || inv.name || "Investor"}</span>
                  {didOpen
                    ? <span className="ml-auto text-[10px] text-emerald-600 font-medium">Opened</span>
                    : <span className="ml-auto text-[10px] text-slate-400">Not opened</span>
                  }
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}