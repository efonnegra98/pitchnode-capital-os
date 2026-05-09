import React, { useState } from "react";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [contactMethod, setContactMethod] = useState(investor.contact_method || "");
  const days = daysSince(investor.last_contact_date);

  const handleSave = () => {
    const today = new Date().toISOString().split("T")[0];
    onSave(investor.id, today, notes, contactMethod);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        className="bg-card border border-border sm:rounded-2xl rounded-t-2xl w-full sm:max-w-md shadow-xl animate-slide-up sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border no-select">
          <div>
            <h2 className="text-base font-semibold text-foreground">Log Follow-Up</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{investor.name}{investor.firm ? ` · ${investor.firm}` : ""}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Last Interaction Context */}
        <div className="px-6 py-4 bg-muted/50 border-b border-border no-select">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {days != null
                ? `Last contact: ${days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"} ago`} (${formatDate(investor.last_contact_date)})`
                : "No previous contact logged"}
            </span>
          </div>
          {investor.next_action_type && (
            <p className="text-xs text-muted-foreground mt-1.5 pl-5">
              Planned action: <span className="font-medium text-foreground">{investor.next_action_type}</span>
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="px-6 py-4 space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider no-select">Contact Method</Label>
            <Select value={contactMethod} onValueChange={setContactMethod}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="How did you connect?" />
              </SelectTrigger>
              <SelectContent>
                {["Email", "LinkedIn", "Phone Call", "In Person", "Event", "Other"].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider no-select">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 text-sm min-h-[100px] resize-none leading-relaxed"
              placeholder="Log what happened and the next step…"
            />
          </div>
          <p className="text-[10px] text-muted-foreground no-select">Saving will update Last Contact to today's date.</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm px-5">
            {isSaving ? "Saving..." : "Log & Update Contact"}
          </Button>
        </div>
      </div>
    </div>
  );
}