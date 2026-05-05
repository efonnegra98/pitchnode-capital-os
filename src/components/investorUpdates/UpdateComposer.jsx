import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Save, Send, Eye, CalendarClock, ArrowLeft, Loader2, Sparkles, X
} from "lucide-react";
import RecipientSelector from "./RecipientSelector";
import EmailPreviewModal from "./EmailPreviewModal";
import ScheduleSendModal from "./ScheduleSendModal";
import OpenRatePanel from "./OpenRatePanel";

const NARRATIVE_FIELDS = [
  { key: "highlights", label: "Headline Summary", placeholder: "Top-level highlights for the month…" },
  { key: "key_wins", label: "Key Wins & Milestones", placeholder: "Major wins, partnerships, contracts…" },
  { key: "product_updates", label: "Product Updates", placeholder: "Key product milestones and progress…" },
  { key: "hiring_updates", label: "Hiring & Team", placeholder: "New hires, open roles, team changes…" },
  { key: "challenges", label: "Challenges", placeholder: "Current challenges or risks…" },
  { key: "asks", label: "Ask", placeholder: "Capital needs, key hires, introductions…" },
];

function SectionLabel({ label, isAI }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</Label>
      {isAI && (
        <span className="flex items-center gap-1 text-[10px] text-violet-500 font-medium">
          <Sparkles className="w-3 h-3" /> AI drafted — edit freely
        </span>
      )}
    </div>
  );
}

export default function UpdateComposer({
  update,
  investors,
  company,
  onSave,
  onSend,
  onSchedule,
  onBack,
  isSaving,
}) {
  const founderName = company?.founder_name || "";
  const companyName = company?.name || "";
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  const [form, setForm] = useState({
    month: month,
    subject_line: `Capital OS Update — ${month}`,
    from_name: founderName,
    recipient_ids: [],
    revenue: "",
    revenue_growth: "",
    burn_rate: "",
    runway_months: "",
    cash_balance: "",
    highlights: "",
    key_wins: "",
    product_updates: "",
    hiring_updates: "",
    challenges: "",
    asks: "",
    ...update,
  });

  const [aiFields, setAiFields] = useState([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    if (update) setForm(prev => ({ ...prev, ...update }));
  }, [update?.id]);

  // Auto-calc runway
  useEffect(() => {
    if (form.cash_balance && form.burn_rate && Number(form.burn_rate) > 0) {
      const runway = Math.round(Number(form.cash_balance) / Number(form.burn_rate));
      setForm(prev => ({ ...prev, runway_months: runway }));
    }
  }, [form.cash_balance, form.burn_rate]);

  // Update subject when month changes
  useEffect(() => {
    if (form.month && !form.subject_line?.includes(form.month)) {
      setForm(prev => ({ ...prev, subject_line: `Capital OS Update — ${form.month}` }));
    }
  }, [form.month]);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (aiFields.includes(field)) setAiFields(prev => prev.filter(f => f !== field));
  };

  const num = (field, value) => set(field, value === "" ? "" : parseFloat(value));

  const handleAIDraft = async () => {
    setIsDrafting(true);
    try {
      const prompt = `You are a startup founder writing a concise monthly investor update for ${companyName || "our company"}.

Data:
- Month: ${form.month}
- Revenue (MRR): ${form.revenue ? `$${Number(form.revenue).toLocaleString()}` : "not provided"}
- MoM Growth: ${form.revenue_growth ? `${form.revenue_growth}%` : "not provided"}
- Burn Rate: ${form.burn_rate ? `$${Number(form.burn_rate).toLocaleString()}/mo` : "not provided"}
- Runway: ${form.runway_months ? `${form.runway_months} months` : "not provided"}
- Cash: ${form.cash_balance ? `$${Number(form.cash_balance).toLocaleString()}` : "not provided"}
- Round: ${company?.round_type || "not specified"}
- Capital committed: ${company?.capital_committed ? `$${Number(company.capital_committed).toLocaleString()}` : "not provided"}
- Target raise: ${company?.target_raise_amount ? `$${Number(company.target_raise_amount).toLocaleString()}` : "not provided"}

Write short, confident, first-person narrative. Be specific where data exists. Use plain text, no markdown. Professional investor communication tone.

Return JSON with exactly: highlights (headline summary, 2-3 sentences), key_wins (bullet-style wins), product_updates (what shipped), hiring_updates (team changes), challenges (honest but confident), asks (what you need from investors).`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            highlights: { type: "string" },
            key_wins: { type: "string" },
            product_updates: { type: "string" },
            hiring_updates: { type: "string" },
            challenges: { type: "string" },
            asks: { type: "string" },
          },
        },
      });

      setForm(prev => ({
        ...prev,
        highlights: result.highlights || prev.highlights,
        key_wins: result.key_wins || prev.key_wins,
        product_updates: result.product_updates || prev.product_updates,
        hiring_updates: result.hiring_updates || prev.hiring_updates,
        challenges: result.challenges || prev.challenges,
        asks: result.asks || prev.asks,
      }));
      setAiFields(["highlights", "key_wins", "product_updates", "hiring_updates", "challenges", "asks"]);
    } catch (e) {
      console.error("AI draft failed", e);
    } finally {
      setIsDrafting(false);
    }
  };

  const charCount = NARRATIVE_FIELDS.reduce((acc, f) => acc + (form[f.key]?.length || 0), 0);
  const isSent = update?.status === "sent";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {showPreview && (
        <EmailPreviewModal
          form={form}
          companyName={companyName}
          founderName={form.from_name || founderName}
          companyLogo={company?.logo_url}
          onClose={() => setShowPreview(false)}
        />
      )}
      {showSchedule && (
        <ScheduleSendModal
          onSchedule={(dt) => { setShowSchedule(false); onSchedule(form, dt); }}
          onClose={() => setShowSchedule(false)}
          isSaving={isSaving}
        />
      )}

      <div className="p-6 space-y-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to updates
        </button>

        {/* Status banner for sent */}
        {isSent && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <Send className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">
              Sent on {update.sent_date ? new Date(update.sent_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"} · {update.recipients_count || 0} recipients
            </p>
          </div>
        )}

        {/* ── Header fields ── */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Update Period</Label>
            <Input
              value={form.month}
              onChange={e => set("month", e.target.value)}
              className="mt-1.5"
              placeholder="e.g. May 2026"
              disabled={isSent}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject Line</Label>
            <Input
              value={form.subject_line || ""}
              onChange={e => set("subject_line", e.target.value)}
              className="mt-1.5"
              placeholder="Capital OS Update — May 2026"
              disabled={isSent}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From Name</Label>
            <Input
              value={form.from_name || ""}
              onChange={e => set("from_name", e.target.value)}
              className="mt-1.5"
              placeholder="Your name"
              disabled={isSent}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Recipients</Label>
            <RecipientSelector
              investors={investors}
              selectedIds={form.recipient_ids || []}
              onChange={(ids) => set("recipient_ids", ids)}
            />
          </div>
        </div>

        {/* ── Financial Metrics ── */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Financial Snapshot</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { field: "revenue", label: "MRR ($)", placeholder: "0" },
              { field: "revenue_growth", label: "MoM Growth (%)", placeholder: "0" },
              { field: "burn_rate", label: "Burn Rate ($)", placeholder: "0" },
              { field: "cash_balance", label: "Cash Balance ($)", placeholder: "0" },
              { field: "runway_months", label: "Runway (months)", placeholder: "Auto" },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <Label className="text-xs text-slate-500">{label}</Label>
                <Input
                  type="number"
                  value={form[field] || ""}
                  onChange={e => num(field, e.target.value)}
                  className="mt-1"
                  placeholder={placeholder}
                  disabled={isSent}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Narrative ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Update Content</h3>
            <button
              type="button"
              onClick={handleAIDraft}
              disabled={isDrafting || isSent}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 transition-all disabled:opacity-50 shadow-sm"
            >
              {isDrafting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Drafting…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> AI Draft Update</>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {NARRATIVE_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <SectionLabel label={label} isAI={aiFields.includes(key)} />
                <Textarea
                  value={form[key] || ""}
                  onChange={e => set(key, e.target.value)}
                  className={`min-h-[90px] text-sm transition-all ${aiFields.includes(key) ? "border-violet-200 bg-violet-50/30" : ""}`}
                  placeholder={placeholder}
                  disabled={isSent}
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-right mt-2">{charCount.toLocaleString()} characters</p>
        </div>

        {/* Open rate for sent updates */}
        <OpenRatePanel update={update} investors={investors} />

        {/* ── Actions ── */}
        {!isSent && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => onSave(form)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-violet-200 text-violet-700 bg-violet-50 text-sm font-medium hover:bg-violet-100 transition-colors"
            >
              <Eye className="w-4 h-4" /> Preview Email
            </button>
            <button
              onClick={() => setShowSchedule(true)}
              disabled={isSaving || !form.recipient_ids?.length}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <CalendarClock className="w-4 h-4" /> Schedule Send
            </button>
            <button
              onClick={() => onSend(form)}
              disabled={isSaving || !form.recipient_ids?.length}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm ml-auto"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Now</>}
            </button>
          </div>
        )}
        {!isSent && !form.recipient_ids?.length && (
          <p className="text-[11px] text-amber-600 -mt-2">Select at least one recipient to send or schedule.</p>
        )}
      </div>
    </div>
  );
}