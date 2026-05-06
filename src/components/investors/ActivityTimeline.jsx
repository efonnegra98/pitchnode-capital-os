import React from "react";
import { Phone, Mail, Users, StickyNote, Link } from "lucide-react";

const TYPE_CONFIG = {
  call:         { label: "Call",         icon: Phone,     color: "bg-blue-100 text-blue-600",     dot: "bg-blue-500"     },
  email:        { label: "Email",        icon: Mail,      color: "bg-violet-100 text-violet-600",  dot: "bg-violet-500"   },
  meeting:      { label: "Meeting",      icon: Users,     color: "bg-emerald-100 text-emerald-600",dot: "bg-emerald-500"  },
  note:         { label: "Note",         icon: StickyNote,color: "bg-amber-100 text-amber-600",    dot: "bg-amber-500"    },
  introduction: { label: "Introduction", icon: Link,      color: "bg-pink-100 text-pink-600",      dot: "bg-pink-500"     },
};

const OUTCOME_COLORS = {
  Positive:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Neutral:     "bg-slate-100 text-slate-600 border-slate-200",
  Negative:    "bg-red-50 text-red-600 border-red-200",
  "No Response": "bg-orange-50 text-orange-600 border-orange-200",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ActivityTimeline({ activities = [] }) {
  const sorted = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted-foreground italic">
        No activity logged yet — add your first touchpoint.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-0 max-h-72 overflow-y-auto pr-1">
        {sorted.map((entry) => {
          const tc = TYPE_CONFIG[entry.activity_type] || TYPE_CONFIG.note;
          const Icon = tc.icon;
          return (
            <div key={entry.id} className="relative flex gap-3 pl-1 pb-4 last:pb-0">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center z-10 ${tc.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tc.color}`}>
                    {tc.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{formatDate(entry.date)}</span>
                  {entry.outcome && (
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${OUTCOME_COLORS[entry.outcome] || ""}`}>
                      {entry.outcome}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground leading-snug">{entry.summary}</p>
                {entry.next_step && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Next:</span> {entry.next_step}
                    {entry.next_step_date && (
                      <span className="ml-1 text-violet-600 font-medium">by {formatDate(entry.next_step_date)}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}