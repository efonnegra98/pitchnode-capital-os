import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trash2, Sparkles } from "lucide-react";
import { suggestNextActionLabel } from "../../lib/nextActionSuggestion";
import ActivityLog from "./ActivityLog";

export default function InvestorModal({ investor, onSave, onDelete, onClose, isSaving }) {
  const [validationError, setValidationError] = useState("");

  const [form, setForm] = useState({
    name: "",
    firm: "",
    email: "",
    contact_method: "",
    stage_focus: "",
    check_size: "",
    relationship_strength: "",
    status: "",
    funnel_stage: "",
    sentiment: "",
    objections: [],
    intro_source: "",
    intro_strength: "",
    intro_by: "",
    last_contact_date: "",
    next_action_date: "",
    next_action_type: "",
    cadence_status: "",
    notes: "",
    ...investor,
  });

  useEffect(() => {
    if (investor) setForm(prev => ({ ...prev, ...investor }));
  }, [investor]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleObjection = (objection) => {
    const current = form.objections || [];
    const updated = current.includes(objection)
      ? current.filter(o => o !== objection)
      : [...current, objection];
    setForm(prev => ({ ...prev, objections: updated }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-foreground">{investor?.id ? "Edit Investor" : "Add Investor"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name <span className="text-slate-400 font-normal text-xs">(or Firm required)</span></Label>
              <Input
                value={form.name}
                onChange={(e) => { handleChange("name", e.target.value); setValidationError(""); }}
                className="mt-1"
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Firm / Organization <span className="text-slate-400 font-normal text-xs">(or Name required)</span></Label>
              <Input
                value={form.firm}
                onChange={(e) => { handleChange("firm", e.target.value); setValidationError(""); }}
                className="mt-1"
                placeholder="Firm or organization"
              />
            </div>
          </div>
          {validationError && (
            <p className="text-xs text-red-600 -mt-2">{validationError}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1"
                placeholder="investor@firm.com"
              />
            </div>
            <div>
              <Label>Contact Method</Label>
              <Select value={form.contact_method || ""} onValueChange={(v) => handleChange("contact_method", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {["Email", "LinkedIn", "Phone Call", "In Person", "Event", "Other"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Investor Type</Label>
            <Select value={form.investor_type || ""} onValueChange={(v) => handleChange("investor_type", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {["Angel", "Family Office", "Venture Capital", "Private Equity", "Strategic/Corporate", "Other"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Stage Focus</Label>
              <Select value={form.stage_focus || ""} onValueChange={(v) => handleChange("stage_focus", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {["Pre-Seed", "Seed", "Series A", "Series B+", "Growth"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Check Size</Label>
              <Input
                value={form.check_size}
                onChange={(e) => handleChange("check_size", e.target.value)}
                className="mt-1"
                placeholder="$250k-$500k"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Relationship Strength</Label>
              <Select value={form.relationship_strength || ""} onValueChange={(v) => handleChange("relationship_strength", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["New", "Building", "Strong", "Champion"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status || ""} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["Warm", "Engaged", "Passed", "Committed"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Funnel Stage</Label>
            <Select value={form.funnel_stage || ""} onValueChange={(v) => handleChange("funnel_stage", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {["Identified", "Contacted", "Intro Call", "Partner Meeting", "Due Diligence", "Term Sheet"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Investor Sentiment</Label>
            <Select value={form.sentiment || ""} onValueChange={(v) => handleChange("sentiment", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select sentiment" />
              </SelectTrigger>
              <SelectContent>
                {["Skeptical", "Curious", "Positive", "Champion", "Neutral"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Objections / Concerns</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Valuation", "Market Risk", "Traction", "Team", "Timing"].map((objection) => (
                <button
                  key={objection}
                  type="button"
                  onClick={() => toggleObjection(objection)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    (form.objections || []).includes(objection)
                      ? "bg-violet-50 border-violet-300 text-violet-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {objection}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Last Contact Date</Label>
            <Input
              type="date"
              value={form.last_contact_date}
              onChange={(e) => handleChange("last_contact_date", e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Introduction Tracking */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">Introduction Tracking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Intro Strength</Label>
                <Select value={form.intro_strength || ""} onValueChange={(v) => handleChange("intro_strength", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Cold", "Warm", "Direct"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Intro Source</Label>
                <Input
                  value={form.intro_source}
                  onChange={(e) => handleChange("intro_source", e.target.value)}
                  className="mt-1"
                  placeholder="e.g., LP, advisor"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Intro Made By</Label>
              <Input
                value={form.intro_by}
                onChange={(e) => handleChange("intro_by", e.target.value)}
                className="mt-1"
                placeholder="Name of person who made intro"
              />
            </div>
          </div>

          {/* Follow-Up Discipline */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">Follow-Up Discipline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Next Action Date</Label>
                <Input
                  type="date"
                  value={form.next_action_date}
                  onChange={(e) => handleChange("next_action_date", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Cadence Status</Label>
                <Select value={form.cadence_status || ""} onValueChange={(v) => handleChange("cadence_status", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["On Track", "Overdue", "Waiting", "Closed"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <Label>Next Action Type</Label>
                {form.sentiment && form.funnel_stage && (
                  <span className="flex items-center gap-1 text-[10px] text-violet-500 font-medium">
                    <Sparkles className="w-3 h-3" />
                    AI Suggested: {suggestNextActionLabel(form)}
                  </span>
                )}
              </div>
              <Select value={form.next_action_type || ""} onValueChange={(v) => handleChange("next_action_type", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  {["Follow-up Email", "Send Materials", "Schedule Meeting", "Partner Intro", "Waiting on Response", "Data Room Access", "Term Sheet Review"].map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                Auto-set on save based on Sentiment + Funnel Stage + Objections.
              </p>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="mt-1 min-h-[80px]"
              placeholder="Notes about this investor..."
            />
          </div>

          <ActivityLog
            entries={[...(form.activity_log || [])].reverse()}
            onAdd={(text) => {
              const newEntry = { text, timestamp: new Date().toISOString() };
              const updated = [...(form.activity_log || []), newEntry];
              handleChange("activity_log", updated);
            }}
          />
        </div>

        <div className="flex items-center justify-between p-5 border-t border-slate-200">
          {investor?.id ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(investor.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!form.name && !form.firm) {
                  setValidationError("Please provide at least a Name or Firm.");
                  return;
                }
                onSave(form);
              }}
              disabled={isSaving}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
            >
              {investor?.id ? "Update" : "Add Investor"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}