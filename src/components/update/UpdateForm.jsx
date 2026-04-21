import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Send, ArrowLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const currentMonth = MONTHS[new Date().getMonth()];

const AI_FIELDS = ["highlights", "product_updates", "key_wins", "asks"];

export default function UpdateForm({ initialData, onSave, onSend, onBack, isSaving, onFormChange, investors = [], company = {} }) {
  const [aiSuggestedFields, setAiSuggestedFields] = useState([]);
  const [isDrafting, setIsDrafting] = useState(false);

  const [form, setForm] = useState({
    month: `${currentMonth} ${currentYear}`,
    revenue: "",
    revenue_growth: "",
    burn_rate: "",
    runway_months: "",
    cash_balance: "",
    highlights: "",
    hiring_updates: "",
    product_updates: "",
    key_wins: "",
    asks: "",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) setForm(prev => ({ ...prev, ...initialData }));
  }, [initialData]);

  useEffect(() => {
    if (onFormChange) {
      onFormChange(form);
    }
  }, [form, onFormChange]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear AI label when user edits the field
    if (aiSuggestedFields.includes(field)) {
      setAiSuggestedFields(prev => prev.filter(f => f !== field));
    }
  };

  const handleAIDraft = async () => {
    setIsDrafting(true);
    try {
      const today = new Date();
      const overdueInvestors = investors.filter(inv => {
        if (!inv.next_action_date) return false;
        return new Date(inv.next_action_date) < today && inv.cadence_status !== "Closed" && inv.status !== "Passed";
      });

      const prompt = `You are a startup founder writing a concise monthly investor update for ${company?.name || "our company"}.

Here is the current month's data:
- Month: ${form.month}
- Revenue: ${form.revenue ? `$${Number(form.revenue).toLocaleString()}` : "not provided"}
- Revenue Growth: ${form.revenue_growth ? `${form.revenue_growth}%` : "not provided"}
- Burn Rate: ${form.burn_rate ? `$${Number(form.burn_rate).toLocaleString()}/mo` : "not provided"}
- Runway: ${form.runway_months ? `${form.runway_months} months` : "not provided"}
- Cash Balance: ${form.cash_balance ? `$${Number(form.cash_balance).toLocaleString()}` : "not provided"}
- Round type: ${company?.round_type || "not specified"}
- Capital committed: ${company?.capital_committed ? `$${Number(company.capital_committed).toLocaleString()}` : "not provided"}
- Target raise: ${company?.target_raise_amount ? `$${Number(company.target_raise_amount).toLocaleString()}` : "not provided"}
- Overdue investor follow-ups: ${overdueInvestors.length > 0 ? overdueInvestors.map(i => i.name || i.firm).join(", ") : "none"}

Write short, confident, first-person narrative for each section. Be specific where data exists. Use plain text, no markdown.

Return JSON with exactly these keys: highlights, product_updates, key_wins, asks`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            highlights: { type: "string" },
            product_updates: { type: "string" },
            key_wins: { type: "string" },
            asks: { type: "string" },
          },
        },
      });

      setForm(prev => ({
        ...prev,
        highlights: result.highlights || prev.highlights,
        product_updates: result.product_updates || prev.product_updates,
        key_wins: result.key_wins || prev.key_wins,
        asks: result.asks || prev.asks,
      }));
      setAiSuggestedFields(AI_FIELDS);
    } catch (e) {
      console.error("AI draft failed", e);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleNumber = (field, value) => {
    const num = value === "" ? "" : parseFloat(value);
    setForm(prev => ({ ...prev, [field]: num }));
  };

  // Auto-calc runway
  useEffect(() => {
    if (form.cash_balance && form.burn_rate && form.burn_rate > 0) {
      const runway = Math.round(form.cash_balance / form.burn_rate);
      setForm(prev => ({ ...prev, runway_months: runway }));
    }
  }, [form.cash_balance, form.burn_rate]);

  return (
    <div className="space-y-8">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to updates
        </button>
      )}

      {/* Month */}
      <div>
        <Label className="uppercase tracking-wider">Update Period</Label>
        <Input
          value={form.month}
          onChange={(e) => handleChange("month", e.target.value)}
          className="mt-2"
          placeholder="e.g. January 2026"
        />
      </div>

      {/* Financial Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Financial Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Revenue ($)</Label>
            <Input
              type="number"
              value={form.revenue}
              onChange={(e) => handleNumber("revenue", e.target.value)}
              className="mt-1.5"
              placeholder="0"
            />
          </div>
          <div>
            <Label>Revenue Growth (%)</Label>
            <Input
              type="number"
              value={form.revenue_growth}
              onChange={(e) => handleNumber("revenue_growth", e.target.value)}
              className="mt-1.5"
              placeholder="0"
            />
          </div>
          <div>
            <Label>Burn Rate ($)</Label>
            <Input
              type="number"
              value={form.burn_rate}
              onChange={(e) => handleNumber("burn_rate", e.target.value)}
              className="mt-1.5"
              placeholder="0"
            />
          </div>
          <div>
            <Label>Cash Balance ($)</Label>
            <Input
              type="number"
              value={form.cash_balance}
              onChange={(e) => handleNumber("cash_balance", e.target.value)}
              className="mt-1.5"
              placeholder="0"
            />
          </div>
          <div>
            <Label>Runway (months) — auto-calculated</Label>
            <Input
              type="number"
              value={form.runway_months}
              onChange={(e) => handleNumber("runway_months", e.target.value)}
              className="mt-1.5"
              placeholder="Auto"
            />
          </div>
        </div>
      </div>

      {/* Narrative Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Narrative</h3>
          <button
            type="button"
            onClick={handleAIDraft}
            disabled={isDrafting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-600 border border-violet-300 bg-violet-50 hover:bg-violet-100 transition-colors disabled:opacity-50"
          >
            {isDrafting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Drafting…</>
            ) : (
              <><span className="text-[13px]">✦</span> AI Draft Update</>
            )}
          </button>
        </div>
        <div className="space-y-4">
          {[
            { key: "highlights", label: "Highlights", placeholder: "Top-level highlights for the month…" },
            { key: "product_updates", label: "Product Updates", placeholder: "Key product milestones and progress…" },
            { key: "hiring_updates", label: "Hiring Updates", placeholder: "New hires, open roles, team changes…" },
            { key: "key_wins", label: "Key Wins", placeholder: "Major wins, partnerships, contracts…" },
            { key: "asks", label: "Asks", placeholder: "Capital needs, key hires, introductions…" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <Label>{label}</Label>
                {aiSuggestedFields.includes(key) && (
                  <span className="text-[10px] text-violet-500 font-medium flex items-center gap-1">
                    <span>✦</span> AI suggested — edit freely
                  </span>
                )}
              </div>
              <Textarea
                value={form[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                className={`min-h-[80px] transition-colors ${aiSuggestedFields.includes(key) ? "border-violet-200 bg-violet-50/30 focus:border-violet-400" : ""}`}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
        <Button
          onClick={() => onSave(form)}
          disabled={isSaving}
          variant="outline"
        >
          <Save className="w-4 h-4 mr-2" /> Save Draft
        </Button>
        <Button
          onClick={() => onSend(form)}
          disabled={isSaving}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
        >
          <Send className="w-4 h-4 mr-2" /> Mark as Sent
        </Button>
      </div>
    </div>
  );
}