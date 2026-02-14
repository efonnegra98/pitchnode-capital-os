import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Send, ArrowLeft } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const currentMonth = MONTHS[new Date().getMonth()];

export default function UpdateForm({ initialData, onSave, onSend, onBack, isSaving }) {
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

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to updates
        </button>
      )}

      {/* Month */}
      <div>
        <Label className="text-white/50 text-xs uppercase tracking-wider">Update Period</Label>
        <Input
          value={form.month}
          onChange={(e) => handleChange("month", e.target.value)}
          className="mt-2 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-500/50"
          placeholder="e.g. January 2026"
        />
      </div>

      {/* Financial Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Financial Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-white/40 text-xs">Revenue ($)</Label>
            <Input
              type="number"
              value={form.revenue}
              onChange={(e) => handleNumber("revenue", e.target.value)}
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-500/50"
              placeholder="0"
            />
          </div>
          <div>
            <Label className="text-white/40 text-xs">Revenue Growth (%)</Label>
            <Input
              type="number"
              value={form.revenue_growth}
              onChange={(e) => handleNumber("revenue_growth", e.target.value)}
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-500/50"
              placeholder="0"
            />
          </div>
          <div>
            <Label className="text-white/40 text-xs">Burn Rate ($)</Label>
            <Input
              type="number"
              value={form.burn_rate}
              onChange={(e) => handleNumber("burn_rate", e.target.value)}
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-500/50"
              placeholder="0"
            />
          </div>
          <div>
            <Label className="text-white/40 text-xs">Cash Balance ($)</Label>
            <Input
              type="number"
              value={form.cash_balance}
              onChange={(e) => handleNumber("cash_balance", e.target.value)}
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-500/50"
              placeholder="0"
            />
          </div>
          <div>
            <Label className="text-white/40 text-xs">Runway (months) — auto-calculated</Label>
            <Input
              type="number"
              value={form.runway_months}
              onChange={(e) => handleNumber("runway_months", e.target.value)}
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white/60 placeholder:text-white/20"
              placeholder="Auto"
            />
          </div>
        </div>
      </div>

      {/* Narrative Sections */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Narrative</h3>
        <div className="space-y-4">
          {[
            { key: "highlights", label: "Highlights", placeholder: "Top-level highlights for the month…" },
            { key: "product_updates", label: "Product Updates", placeholder: "Key product milestones and progress…" },
            { key: "hiring_updates", label: "Hiring Updates", placeholder: "New hires, open roles, team changes…" },
            { key: "key_wins", label: "Key Wins", placeholder: "Major wins, partnerships, contracts…" },
            { key: "asks", label: "Asks", placeholder: "Capital needs, key hires, introductions…" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <Label className="text-white/40 text-xs">{label}</Label>
              <Textarea
                value={form[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-500/50 min-h-[80px]"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/[0.06]">
        <Button
          onClick={() => onSave(form)}
          disabled={isSaving}
          className="bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]"
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