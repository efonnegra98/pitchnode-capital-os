import React, { useState } from "react";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function FollowUpModal({ investor, onSave, onClose, isSaving }) {
  const [notes, setNotes] = useState("");
  const days = daysSince(investor.last_contact_date);

  const handleSave = () => {
    const today = new Date().toISOString().split("T")[0];
    onSave(investor.id, today, notes);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Log Follow-Up</h2>
            <p className="text-xs text-slate-500 mt-0.5">{investor.name}{investor.firm ? ` · ${investor.firm}` : ""}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Last Interaction Context */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">
              {days != null
                ? `Last contact: ${days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"} ago`} (${formatDate(investor.last_contact_date)})`
                : "No previous contact logged"}
            </span>
          </div>
          {investor.next_action_type && (
            <p className="text-xs text-slate-500 mt-1.5 pl-5">
              Planned action: <span className="font-medium text-slate-700">{investor.next_action_type}</span>
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="px-6 py-4 space-y-3">
          <div>
            <Label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 text-sm min-h-[120px] resize-none leading-relaxed"
              placeholder="Log what happened and the next step…"
            />
          </div>
          <p className="text-[10px] text-slate-400">Saving will update Last Contact to today's date.</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm px-5"
          >
            {isSaving ? "Saving..." : "Log & Update Contact"}
          </Button>
        </div>
      </div>
    </div>
  );
}