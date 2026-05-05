import React from "react";
import { Send, FileText, Plus } from "lucide-react";

function StatusBadge({ status }) {
  if (status === "sent") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Sent
    </span>
  );
  if (status === "scheduled") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Scheduled
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Draft
    </span>
  );
}

function OpenRateBadge({ update }) {
  if (update.status !== "sent" || !update.recipients_count) return null;
  const opened = update.opened_count || 0;
  const rate = Math.round((opened / update.recipients_count) * 100);
  return (
    <span className="text-[10px] text-slate-400">
      {opened}/{update.recipients_count} opened ({rate}%)
    </span>
  );
}

function UpdateItem({ update, isSelected, onClick }) {
  const now = new Date();
  const month = update.month || "Untitled";
  const title = `${month} Investor Update`;

  const dateLabel = update.status === "sent" && update.sent_date
    ? new Date(update.sent_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : update.status === "scheduled" && update.scheduled_date
    ? `Scheduled ${new Date(update.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : new Date(update.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? "bg-violet-50 border-violet-300 shadow-sm"
          : "bg-white border-slate-200 hover:border-violet-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
        <StatusBadge status={update.status} />
      </div>
      <p className="text-[11px] text-slate-400 mb-1.5">{dateLabel}</p>
      <div className="flex items-center gap-3 flex-wrap">
        {update.recipients_count > 0 && (
          <span className="text-[10px] text-slate-400">
            Sent to {update.recipients_count} investor{update.recipients_count !== 1 ? "s" : ""}
          </span>
        )}
        <OpenRateBadge update={update} />
      </div>
    </button>
  );
}

export default function UpdatesList({ updates, selectedId, onSelect, onNew, isCreating }) {
  const sorted = [...updates].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">All Updates</h2>
        <button
          onClick={onNew}
          disabled={isCreating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          New Update
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Send className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No updates yet</p>
          <p className="text-xs text-slate-400">Create your first investor update</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1">
          {sorted.map((u) => (
            <UpdateItem
              key={u.id}
              update={u}
              isSelected={selectedId === u.id}
              onClick={() => onSelect(u)}
            />
          ))}
        </div>
      )}
    </div>
  );
}