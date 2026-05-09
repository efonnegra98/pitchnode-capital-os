import React, { useState } from "react";
import { X, Phone, Mail, Users, StickyNote, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ACTIVITY_TYPES = [
  { key: "call",         label: "📞 Call",         icon: Phone  },
  { key: "email",        label: "📧 Email",        icon: Mail   },
  { key: "meeting",      label: "🤝 Meeting",      icon: Users  },
  { key: "note",         label: "📝 Note",         icon: StickyNote },
  { key: "introduction", label: "🔗 Introduction", icon: Link   },
];

const OUTCOMES = ["Positive", "Neutral", "Negative", "No Response"];

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function LogActivityModal({ investor, onSave, onClose, isSaving }) {
  const [form, setForm] = useState({
    activity_type: "call",
    date: today(),
    summary: "",
    next_step: "",
    next_step_date: "",
    outcome: "",
  });
  const [error, setError] = useState("");

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.activity_type || !form.date || !form.summary.trim()) {
      setError("Activity type, date, and summary are required.");
      return;
    }
    setError("");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        className="bg-card border border-border sm:rounded-2xl rounded-t-2xl w-full sm:max-w-md flex flex-col animate-slide-up sm:animate-none"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0 no-select">
          <div>
            <h2 className="text-base font-semibold text-foreground">Log Activity</h2>
            {investor?.firm && (
              <p className="text-xs text-muted-foreground mt-0.5">{investor.firm}</p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {/* Activity Type */}
          <div>
            <Label>Activity Type <span className="text-red-400">*</span></Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set("activity_type", t.key)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all font-medium ${
                    form.activity_type === t.key
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-card border-border text-foreground hover:bg-accent"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <Label>Date <span className="text-red-400">*</span></Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Summary */}
          <div>
            <Label>Summary <span className="text-red-400">*</span></Label>
            <textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="What happened? Key takeaways."
              className="mt-1 w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Outcome */}
          <div>
            <Label>Outcome</Label>
            <Select value={form.outcome || ""} onValueChange={(v) => set("outcome", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select outcome (optional)" /></SelectTrigger>
              <SelectContent>
                {OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Next Step */}
          <div>
            <Label>Next Step</Label>
            <Input
              value={form.next_step}
              onChange={(e) => set("next_step", e.target.value)}
              placeholder="What is the agreed next action?"
              className="mt-1"
            />
          </div>

          {/* Next Step Date */}
          {form.next_step && (
            <div>
              <Label>Next Step Due Date</Label>
              <Input
                type="date"
                value={form.next_step_date}
                onChange={(e) => set("next_step_date", e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border flex-shrink-0 bg-card">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
          >
            {isSaving ? "Saving..." : "Log Activity"}
          </Button>
        </div>
      </div>
    </div>
  );
}