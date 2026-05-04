import React, { useState } from "react";
import { Phone, Mail, Users, StickyNote, ChevronRight, Plus, Send } from "lucide-react";

const ACTIVITY_TYPES = [
  { key: "call",    label: "Call",    icon: Phone,      color: "bg-blue-100 text-blue-600",    dot: "bg-blue-500"    },
  { key: "email",   label: "Email",   icon: Mail,       color: "bg-violet-100 text-violet-600", dot: "bg-violet-500" },
  { key: "meeting", label: "Meeting", icon: Users,      color: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" },
  { key: "note",    label: "Note",    icon: StickyNote, color: "bg-amber-100 text-amber-600",   dot: "bg-amber-500"   },
];

function getTypeConfig(typeKey) {
  return ACTIVITY_TYPES.find(t => t.key === typeKey) || ACTIVITY_TYPES[3]; // default: note
}

function formatTimestamp(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 0) return `Today · ${time}`;
  if (diffDays === 1) return `Yesterday · ${time}`;
  if (diffDays < 7)  return `${diffDays}d ago · ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ` · ${time}`;
}

export default function ActivityLog({ entries = [], onAdd }) {
  const [selectedType, setSelectedType] = useState("note");
  const [text, setText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, selectedType);
    setText("");
    setShowInput(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
    if (e.key === "Escape") { setShowInput(false); setText(""); }
  };

  // Sort entries newest first
  const sorted = [...entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="pt-4 border-t border-slate-200">

      {/* Header + Quick-log button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Activity Timeline</h3>
        <button
          onClick={() => setShowInput(s => !s)}
          className="flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" /> Log Activity
        </button>
      </div>

      {/* Quick-log panel */}
      {showInput && (
        <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
          {/* Type selector */}
          <div className="flex gap-1.5 flex-wrap">
            {ACTIVITY_TYPES.map((t) => {
              const Icon = t.icon;
              const active = selectedType === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setSelectedType(t.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? `${t.color} border-current shadow-sm`
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Text input */}
          <div className="flex gap-2">
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Describe this ${getTypeConfig(selectedType).label.toLowerCase()}...`}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 bg-white"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {sorted.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          No activity logged yet. Use "Log Activity" above to add your first entry.
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />

          <div className="space-y-0 max-h-64 overflow-y-auto pr-1">
            {sorted.map((entry, i) => {
              const tc = getTypeConfig(entry.type);
              const Icon = tc.icon;
              return (
                <div key={i} className="relative flex gap-3 pl-1 pb-4 last:pb-0">
                  {/* Icon dot on the line */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center z-10 ${tc.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-slate-800 leading-snug">{entry.text}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tc.color}`}>
                        {tc.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatTimestamp(entry.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}