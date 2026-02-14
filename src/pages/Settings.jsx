import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompany } from "../components/useCompany";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Upload, CreditCard, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ACCENT_OPTIONS = [
  { label: "Violet", value: "#7C3AED" },
  { label: "Indigo", value: "#6366F1" },
  { label: "Purple", value: "#9333EA" },
  { label: "Plum", value: "#A855F7" },
  { label: "Deep Violet", value: "#5B21B6" },
];

export default function Settings() {
  const queryClient = useQueryClient();
  const { company, companyId, isLoading: companyLoading } = useCompany();

  const isLoading = companyLoading;

  const [form, setForm] = useState({
    company_name: "",
    founder_name: "",
    founder_title: "",
    accent_color: "#7C3AED",
    email_signature: "",
    logo_url: "",
    raise_mode: false,
    target_raise_amount: "",
    capital_committed: "",
    soft_commitments: "",
    round_type: "",
    target_close_date: "",
  });

  useEffect(() => {
    if (company) {
      setForm(prev => ({
        ...prev,
        company_name: company.name || "",
        founder_name: company.founder_name || "",
        founder_title: company.founder_title || "",
        accent_color: company.accent_color || "#7C3AED",
        logo_url: company.logo_url || "",
        raise_mode: company.raise_mode || false,
        target_raise_amount: company.target_raise_amount || "",
        capital_committed: company.capital_committed || "",
        soft_commitments: company.soft_commitments || "",
        round_type: company.round_type || "",
        target_close_date: company.target_close_date || "",
      }));
    }
  }, [company]);

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        name: formData.company_name,
        founder_name: formData.founder_name,
        founder_title: formData.founder_title,
        accent_color: formData.accent_color,
        logo_url: formData.logo_url,
        raise_mode: formData.raise_mode,
        target_raise_amount: formData.target_raise_amount,
        capital_committed: formData.capital_committed,
        soft_commitments: formData.soft_commitments,
        round_type: formData.round_type,
        target_close_date: formData.target_close_date,
      };
      return base44.entities.Company.update(companyId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange("logo_url", file_url);
  };

  const handleNumber = (field, value) => {
    const num = value === "" ? "" : parseFloat(value);
    handleChange(field, num);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your company profile and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Company Profile */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-5">Company Profile</h2>
          <div className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input
                value={form.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                className="mt-1.5"
                placeholder="Your company name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Founder Name</Label>
                <Input
                  value={form.founder_name}
                  onChange={(e) => handleChange("founder_name", e.target.value)}
                  className="mt-1.5"
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={form.founder_title}
                  onChange={(e) => handleChange("founder_title", e.target.value)}
                  className="mt-1.5"
                  placeholder="CEO & Founder"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-5">Logo</h2>
          <div className="flex items-center gap-6">
            {form.logo_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
            )}
            <div>
              <label className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-foreground text-sm font-medium cursor-pointer transition-all inline-block">
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              <p className="text-muted-foreground text-xs mt-2">PNG or SVG recommended</p>
            </div>
          </div>
        </div>

        {/* Brand Accent */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-5">Brand Accent</h2>
          <div className="flex flex-wrap gap-3">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange("accent_color", opt.value)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border transition-all ${
                  form.accent_color === opt.value
                    ? "border-violet-300 bg-violet-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: opt.value }} />
                <span className="text-xs text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Email Signature */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-5">Email Signature</h2>
          <Textarea
            value={form.email_signature}
            onChange={(e) => handleChange("email_signature", e.target.value)}
            className="min-h-[100px]"
            placeholder="Your email signature for investor updates..."
          />
        </div>

        {/* Raise Mode */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Raise Mode</h2>
              <p className="text-muted-foreground text-xs mt-1">Enable fundraising command layer on dashboard</p>
            </div>
            <button
              onClick={() => handleChange("raise_mode", !form.raise_mode)}
              className={`relative w-12 h-6 rounded-full transition-all ${
                form.raise_mode ? "bg-violet-600" : "bg-slate-200"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  form.raise_mode ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {form.raise_mode && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Round Type</Label>
                  <Select value={form.round_type || ""} onValueChange={(v) => handleChange("round_type", v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Close Date</Label>
                  <Input
                    type="date"
                    value={form.target_close_date}
                    onChange={(e) => handleChange("target_close_date", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Target Raise ($)</Label>
                  <Input
                    type="number"
                    value={form.target_raise_amount}
                    onChange={(e) => handleNumber("target_raise_amount", e.target.value)}
                    className="mt-1.5"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Capital Committed ($)</Label>
                  <Input
                    type="number"
                    value={form.capital_committed}
                    onChange={(e) => handleNumber("capital_committed", e.target.value)}
                    className="mt-1.5"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Soft Commitments ($)</Label>
                  <Input
                    type="number"
                    value={form.soft_commitments}
                    onChange={(e) => handleNumber("soft_commitments", e.target.value)}
                    className="mt-1.5"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Placeholder */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-5">Subscription</h2>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <CreditCard className="w-5 h-5 text-violet-600" />
            <div>
              <p className="text-foreground text-sm font-medium">Pro Plan — Coming Soon</p>
              <p className="text-muted-foreground text-xs mt-0.5">Stripe billing integration will be available in a future release.</p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pb-8">
          <Button
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}