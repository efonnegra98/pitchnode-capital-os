import React, { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function ActivityLog({ entries = [], onAdd }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="pt-4 border-t border-slate-200">
      <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">Activity Log</h3>

      {/* Quick log input */}
      <div className="flex items-center gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Log an activity (e.g. Had intro call — positive on valuation)"
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 bg-white"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Log
        </button>
      </div>

      {/* Feed */}
      {entries.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">
          No activity logged yet. Add your first note above.
        </div>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-50 rounded-lg px-3 py-2.5">
              <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 leading-snug">{entry.text}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(entry.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}