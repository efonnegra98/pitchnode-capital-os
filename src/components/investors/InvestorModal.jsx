import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trash2 } from "lucide-react";

export default function InvestorModal({ investor, onSave, onDelete, onClose, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    firm: "",
    email: "",
    stage_focus: "",
    check_size: "",
    relationship_strength: "",
    status: "",
    last_contact_date: "",
    notes: "",
    ...investor,
  });

  useEffect(() => {
    if (investor) setForm(prev => ({ ...prev, ...investor }));
  }, [investor]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#12101f] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">{investor?.id ? "Edit Investor" : "Add Investor"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/40 text-xs">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
                placeholder="Full name"
              />
            </div>
            <div>
              <Label className="text-white/40 text-xs">Firm</Label>
              <Input
                value={form.firm}
                onChange={(e) => handleChange("firm", e.target.value)}
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
                placeholder="Investment firm"
              />
            </div>
          </div>

          <div>
            <Label className="text-white/40 text-xs">Email</Label>
            <Input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
              placeholder="investor@firm.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/40 text-xs">Stage Focus</Label>
              <Select value={form.stage_focus || ""} onValueChange={(v) => handleChange("stage_focus", v)}>
                <SelectTrigger className="mt-1 bg-white/[0.04] border-white/[0.08] text-white">
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
              <Label className="text-white/40 text-xs">Check Size</Label>
              <Input
                value={form.check_size}
                onChange={(e) => handleChange("check_size", e.target.value)}
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
                placeholder="$250k-$500k"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/40 text-xs">Relationship Strength</Label>
              <Select value={form.relationship_strength || ""} onValueChange={(v) => handleChange("relationship_strength", v)}>
                <SelectTrigger className="mt-1 bg-white/[0.04] border-white/[0.08] text-white">
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
              <Label className="text-white/40 text-xs">Status</Label>
              <Select value={form.status || ""} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="mt-1 bg-white/[0.04] border-white/[0.08] text-white">
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
            <Label className="text-white/40 text-xs">Last Contact Date</Label>
            <Input
              type="date"
              value={form.last_contact_date}
              onChange={(e) => handleChange("last_contact_date", e.target.value)}
              className="mt-1 bg-white/[0.04] border-white/[0.08] text-white"
            />
          </div>

          <div>
            <Label className="text-white/40 text-xs">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="mt-1 bg-white/[0.04] border-white/[0.08] text-white min-h-[80px]"
              placeholder="Notes about this investor..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-5 border-t border-white/[0.06]">
          {investor?.id ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(investor.id)}
              className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white/40 hover:text-white hover:bg-white/[0.06]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSave(form)}
              disabled={isSaving || !form.name}
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