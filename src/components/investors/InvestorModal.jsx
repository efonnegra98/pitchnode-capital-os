import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trash2, Sparkles, Linkedin, Globe, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { suggestNextActionLabel } from "../../lib/nextActionSuggestion";
import ActivityLog from "./ActivityLog";
import SmartNextAction from "./SmartNextAction";
import ActivityTimeline from "./ActivityTimeline";

const FIRM_TYPES = ["Venture Capital", "Angel", "Family Office", "Corporate / Strategic", "Accelerator", "Private Equity", "Operator", "Strategic Investor", "Search Fund", "Other"];
const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B+", "Growth"];
const STATUSES = ["Warm", "Engaged", "Passed", "Committed"];
const FUNNEL_STAGES = ["Identified", "Researching", "Outreach Sent", "Intro Call Scheduled", "Intro Call Complete", "Interest Confirmed", "Diligence", "Term Sheet", "Closed Won", "Closed Lost", "Pass"];
const SENTIMENTS = ["Skeptical", "Curious", "Positive", "Champion", "Neutral"];
const OBJECTIONS = ["Valuation", "Market Risk", "Traction", "Team", "Timing"];
const NEXT_ACTIONS = ["Follow-up Email", "Send Materials", "Schedule Meeting", "Partner Intro", "Waiting on Response", "Data Room Access", "Term Sheet Review"];
const CONTACT_METHODS = ["Email", "LinkedIn", "Phone Call", "In Person", "Event", "Other"];
const REL_STRENGTHS = ["New", "Building", "Strong", "Champion"];
const INTRO_STRENGTHS = ["Cold", "Warm", "Direct"];

function SectionHeader({ children }) {
  return (
    <h3 className="text-[10px] font-bold text-violet-600 uppercase tracking-widest pt-4 pb-1 border-t border-border">
      {children}
    </h3>
  );
}

function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left"
      >
        <span>{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  firm: "",
  firm_type: "",
  website_url: "",
  portfolio_count: "",
  portfolio_companies: "",
  name: "",
  email: "",
  linkedin_url: "",
  contact_method: "",
  stage_focus: "",
  check_size_min: "",
  check_size_max: "",
  check_size: "",
  investment_thesis: "",
  preferred_sectors: "",
  relationship_strength: "",
  status: "",
  funnel_stage: "",
  sentiment: "",
  objections: [],
  objections_notes: "",
  intro_source: "",
  intro_strength: "",
  intro_by: "",
  warm_intro_path: "",
  last_contact_date: "",
  last_meeting_notes: "",
  next_action_date: "",
  next_action_type: "",
  cadence_status: "",
  notes: "",
};

export default function InvestorModal({ investor, onSave, onDelete, onClose, isSaving, activities = [], onLogActivity }) {
  const [validationError, setValidationError] = useState("");
  const isEditing = !!investor?.id;

  const [form, setForm] = useState({ ...EMPTY_FORM, ...investor });

  useEffect(() => {
    if (investor) setForm({ ...EMPTY_FORM, ...investor });
  }, [investor]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleObjection = (obj) => {
    const current = form.objections || [];
    handleChange("objections", current.includes(obj) ? current.filter(o => o !== obj) : [...current, obj]);
  };

  const handleSubmit = () => {
    if (!form.firm?.trim()) {
      setValidationError("Firm name is required.");
      return;
    }
    setValidationError("");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Fixed Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{isEditing ? "Edit Firm" : "Add Investor Firm"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Firm-level investor profile</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">

          {/* Smart next action + Log Activity button — edit mode only */}
          {isEditing && (
            <div className="space-y-3">
              <SmartNextAction investor={form} variant="card" />
              {onLogActivity && (
                <button
                  type="button"
                  onClick={onLogActivity}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-violet-300 text-violet-700 hover:bg-violet-50 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Log Activity
                </button>
              )}
            </div>
          )}

          {/* ── PRIMARY FIELDS ── */}
          <div>
            <Label>Firm Name <span className="text-red-400">*</span></Label>
            <Input
              value={form.firm}
              onChange={(e) => { handleChange("firm", e.target.value); setValidationError(""); }}
              className="mt-1"
              placeholder="e.g. Sequoia Capital"
              autoFocus
            />
            {validationError && <p className="text-xs text-red-600 mt-1">{validationError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Firm Type</Label>
              <Select value={form.firm_type || ""} onValueChange={(v) => handleChange("firm_type", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {FIRM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stage Focus</Label>
              <Select value={form.stage_focus || ""} onValueChange={(v) => handleChange("stage_focus", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select stage" /></SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Contact Name</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-1"
              placeholder="Partner / GP name"
            />
          </div>

          <div>
            <Label>Funnel Stage</Label>
            <Select value={form.funnel_stage || ""} onValueChange={(v) => handleChange("funnel_stage", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select stage" /></SelectTrigger>
              <SelectContent>
                {FUNNEL_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* ── ADDITIONAL DETAILS (collapsed) ── */}
          <CollapsibleSection title="Additional Details">
            <SectionHeader>Firm Details</SectionHeader>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check Size Min ($)</Label>
                <Input
                  type="number"
                  value={form.check_size_min || ""}
                  onChange={(e) => handleChange("check_size_min", e.target.value ? Number(e.target.value) : "")}
                  className="mt-1"
                  placeholder="e.g. 250000"
                />
              </div>
              <div>
                <Label>Check Size Max ($)</Label>
                <Input
                  type="number"
                  value={form.check_size_max || ""}
                  onChange={(e) => handleChange("check_size_max", e.target.value ? Number(e.target.value) : "")}
                  className="mt-1"
                  placeholder="e.g. 1000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Portfolio Co. Count</Label>
                <Input
                  type="number"
                  value={form.portfolio_count || ""}
                  onChange={(e) => handleChange("portfolio_count", e.target.value ? Number(e.target.value) : "")}
                  className="mt-1"
                  placeholder="e.g. 45"
                />
              </div>
              <div>
                <Label>Preferred Sectors</Label>
                <Input
                  value={form.preferred_sectors || ""}
                  onChange={(e) => handleChange("preferred_sectors", e.target.value)}
                  className="mt-1"
                  placeholder="e.g. SaaS, AI"
                />
              </div>
            </div>

            <div>
              <Label>Notable Portfolio Companies</Label>
              <Input
                value={form.portfolio_companies || ""}
                onChange={(e) => handleChange("portfolio_companies", e.target.value)}
                className="mt-1"
                placeholder="e.g. Stripe, Airbnb, Notion"
              />
            </div>

            <div>
              <Label>Investment Thesis</Label>
              <Textarea
                value={form.investment_thesis || ""}
                onChange={(e) => handleChange("investment_thesis", e.target.value)}
                className="mt-1 min-h-[80px]"
                placeholder="What does this firm focus on?"
              />
            </div>

            <div>
              <Label>Website</Label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={form.website_url || ""}
                  onChange={(e) => handleChange("website_url", e.target.value)}
                  className="pl-8"
                  placeholder="https://firm.com"
                />
              </div>
            </div>

            <SectionHeader>Contact Details</SectionHeader>

            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1"
                placeholder="partner@firm.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label>LinkedIn URL</Label>
                  {form.linkedin_url && (
                    <a href={form.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-medium text-[#0077B5] hover:underline">
                      <Linkedin className="w-3 h-3" /> View
                    </a>
                  )}
                </div>
                <div className="relative mt-1">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0077B5]" />
                  <Input
                    value={form.linkedin_url}
                    onChange={(e) => handleChange("linkedin_url", e.target.value)}
                    className="pl-8"
                    placeholder="linkedin.com/in/..."
                  />
                </div>
              </div>
              <div>
                <Label>Contact Method</Label>
                <Select value={form.contact_method || ""} onValueChange={(v) => handleChange("contact_method", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SectionHeader>Relationship & Status</SectionHeader>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Relationship Strength</Label>
                <Select value={form.relationship_strength || ""} onValueChange={(v) => handleChange("relationship_strength", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {REL_STRENGTHS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status || ""} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Investor Sentiment</Label>
              <Select value={form.sentiment || ""} onValueChange={(v) => handleChange("sentiment", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select sentiment" /></SelectTrigger>
                <SelectContent>
                  {SENTIMENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Objections / Concerns</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {OBJECTIONS.map((obj) => (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => toggleObjection(obj)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      (form.objections || []).includes(obj)
                        ? "bg-violet-50 dark:bg-violet-950/40 border-violet-300 text-violet-700"
                        : "bg-background border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Objections Detail</Label>
              <Textarea
                value={form.objections_notes || ""}
                onChange={(e) => handleChange("objections_notes", e.target.value)}
                className="mt-1 min-h-[60px]"
                placeholder="What specific concerns did they raise?"
              />
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

            <div>
              <Label>Notes from Last Meeting</Label>
              <Textarea
                value={form.last_meeting_notes || ""}
                onChange={(e) => handleChange("last_meeting_notes", e.target.value)}
                className="mt-1 min-h-[80px]"
                placeholder="What was discussed? Key takeaways..."
              />
            </div>

            <SectionHeader>Introduction Tracking</SectionHeader>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Intro Strength</Label>
                <Select value={form.intro_strength || ""} onValueChange={(v) => handleChange("intro_strength", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {INTRO_STRENGTHS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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

            <div>
              <Label>Intro Made By</Label>
              <Input
                value={form.intro_by}
                onChange={(e) => handleChange("intro_by", e.target.value)}
                className="mt-1"
                placeholder="Name of person who made intro"
              />
            </div>

            <div>
              <Label>Warm Intro Path</Label>
              <Input
                value={form.warm_intro_path || ""}
                onChange={(e) => handleChange("warm_intro_path", e.target.value)}
                className="mt-1"
                placeholder="Who in your network knows this investor?"
              />
            </div>

            <SectionHeader>Follow-Up Discipline</SectionHeader>

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
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["On Track", "Overdue", "Waiting", "Closed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Next Action Type</Label>
                {form.sentiment && form.funnel_stage && (
                  <span className="flex items-center gap-1 text-[10px] text-violet-500 font-medium">
                    <Sparkles className="w-3 h-3" />
                    AI: {suggestNextActionLabel(form)}
                  </span>
                )}
              </div>
              <Select value={form.next_action_type || ""} onValueChange={(v) => handleChange("next_action_type", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select action type" /></SelectTrigger>
                <SelectContent>
                  {NEXT_ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <SectionHeader>Notes</SectionHeader>

            <Textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="min-h-[80px]"
              placeholder="Notes about this firm / opportunity..."
            />

            {isEditing && (
              <div className="pt-2">
                <h3 className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-3">Activity Timeline</h3>
                <ActivityTimeline activities={activities} />
              </div>
            )}
          </CollapsibleSection>
        </div>

        {/* ── Fixed Footer ── */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border flex-shrink-0 bg-card">
          {isEditing ? (
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
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
            >
              {isSaving ? "Saving..." : isEditing ? "Update Firm" : "Add Firm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}