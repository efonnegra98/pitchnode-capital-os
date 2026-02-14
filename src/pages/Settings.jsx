import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Upload, CreditCard } from "lucide-react";

const ACCENT_OPTIONS = [
  { label: "Violet", value: "#7C3AED" },
  { label: "Indigo", value: "#6366F1" },
  { label: "Purple", value: "#9333EA" },
  { label: "Plum", value: "#A855F7" },
  { label: "Deep Violet", value: "#5B21B6" },
];

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: settingsList = [], isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => base44.entities.CompanySettings.list(),
  });

  const existingSettings = settingsList[0] || null;

  const [form, setForm] = useState({
    company_name: "",
    founder_name: "",
    founder_title: "",
    accent_color: "#7C3AED",
    email_signature: "",
    logo_url: "",
  });

  useEffect(() => {
    if (existingSettings) {
      setForm(prev => ({
        ...prev,
        ...existingSettings,
      }));
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      if (existingSettings?.id) {
        return base44.entities.CompanySettings.update(existingSettings.id, formData);
      }
      return base44.entities.CompanySettings.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
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

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-white/30 text-sm mt-1">Configure your company profile and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Company Profile */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">Company Profile</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-white/40 text-xs">Company Name</Label>
              <Input
                value={form.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20"
                placeholder="Your company name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/40 text-xs">Founder Name</Label>
                <Input
                  value={form.founder_name}
                  onChange={(e) => handleChange("founder_name", e.target.value)}
                  className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20"
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label className="text-white/40 text-xs">Title</Label>
                <Input
                  value={form.founder_title}
                  onChange={(e) => handleChange("founder_title", e.target.value)}
                  className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20"
                  placeholder="CEO & Founder"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">Logo</h2>
          <div className="flex items-center gap-6">
            {form.logo_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/[0.06] flex items-center justify-center">
                <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.1] flex items-center justify-center">
                <Upload className="w-5 h-5 text-white/20" />
              </div>
            )}
            <div>
              <label className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-sm font-medium cursor-pointer transition-all inline-block">
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              <p className="text-white/20 text-xs mt-2">PNG or SVG recommended</p>
            </div>
          </div>
        </div>

        {/* Brand Accent */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">Brand Accent</h2>
          <div className="flex flex-wrap gap-3">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange("accent_color", opt.value)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border transition-all ${
                  form.accent_color === opt.value
                    ? "border-violet-500/40 bg-violet-500/10"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: opt.value }} />
                <span className="text-xs text-white/60">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Email Signature */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">Email Signature</h2>
          <Textarea
            value={form.email_signature}
            onChange={(e) => handleChange("email_signature", e.target.value)}
            className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 min-h-[100px]"
            placeholder="Your email signature for investor updates..."
          />
        </div>

        {/* Subscription Placeholder */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">Subscription</h2>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <CreditCard className="w-5 h-5 text-violet-400/50" />
            <div>
              <p className="text-white/60 text-sm font-medium">Pro Plan — Coming Soon</p>
              <p className="text-white/25 text-xs mt-0.5">Stripe billing integration will be available in a future release.</p>
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