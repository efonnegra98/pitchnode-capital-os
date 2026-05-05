import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompany } from "../components/useCompany";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Upload, AlertTriangle, Sun, Moon, Monitor } from "lucide-react";
import BillingSection from "../components/settings/BillingSection";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/lib/ThemeContext";

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-[#6D5DF6] uppercase tracking-wider">{title}</h2>
      {description && <p className="text-muted-foreground text-xs mt-1">{description}</p>}
      <div className="mt-3 border-t border-border" />
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${checked ? "bg-violet-600" : "bg-slate-200"}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { company, companyId, isLoading: companyLoading, user } = useCompany();
  const { theme, setTheme } = useTheme();

  const [form, setForm] = useState({
    // Company Profile
    company_name: "",
    founder_name: "",
    founder_title: "",
    website_url: "",
    logo_url: "",
    // Round Configuration
    raise_mode: false,
    capital_type: "",
    round_type: "",
    target_raise_amount: "",
    capital_committed: "",
    soft_commitments: "",
    target_close_date: "",
    // Update Preferences
    email_signature: "",
    reply_to_email: "",
    update_cadence: "Monthly",
    // Notifications
    notif_overdue_followup: true,
    notif_dataroom_views: true,
    notif_update_reminders: true,
    notif_round_milestones: false,
  });

  useEffect(() => {
    if (company) {
      setForm(prev => ({
        ...prev,
        company_name: company.name || "",
        founder_name: company.founder_name || "",
        founder_title: company.founder_title || "",
        website_url: company.website_url || "",
        logo_url: company.logo_url || "",
        raise_mode: company.raise_mode || false,
        capital_type: company.capital_type || "",
        round_type: company.round_type || "",
        target_raise_amount: company.target_raise_amount || "",
        capital_committed: company.capital_committed || "",
        soft_commitments: company.soft_commitments || "",
        target_close_date: company.target_close_date || "",
        email_signature: company.email_signature || "",
        reply_to_email: company.reply_to_email || "",
        update_cadence: company.update_cadence || "Monthly",
        notif_overdue_followup: company.notif_overdue_followup ?? true,
        notif_dataroom_views: company.notif_dataroom_views ?? true,
        notif_update_reminders: company.notif_update_reminders ?? true,
        notif_round_milestones: company.notif_round_milestones ?? false,
      }));
    }
  }, [company]);

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const toNum = (v) => (v === "" || v === null || v === undefined) ? null : parseFloat(v) || 0;
      const payload = {
        name: formData.company_name,
        founder_name: formData.founder_name,
        founder_title: formData.founder_title,
        website_url: formData.website_url,
        logo_url: formData.logo_url,
        raise_mode: formData.raise_mode,
        capital_type: formData.capital_type || undefined,
        round_type: formData.round_type || undefined,
        target_raise_amount: toNum(formData.target_raise_amount),
        capital_committed: toNum(formData.capital_committed),
        soft_commitments: toNum(formData.soft_commitments),
        target_close_date: formData.target_close_date || undefined,
        email_signature: formData.email_signature,
        reply_to_email: formData.reply_to_email,
        update_cadence: formData.update_cadence,
        notif_overdue_followup: formData.notif_overdue_followup,
        notif_dataroom_views: formData.notif_dataroom_views,
        notif_update_reminders: formData.notif_update_reminders,
        notif_round_milestones: formData.notif_round_milestones,
      };
      if (!companyId) throw new Error("No company ID found");
      return base44.entities.Company.update(companyId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      toast({ title: "Settings saved", description: "Your changes have been saved successfully." });
    },
    onError: (error) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleNumber = (field, value) => handleChange(field, value === "" ? "" : parseFloat(value));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange("logo_url", file_url);
  };

  if (companyLoading) {
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
    <div className="min-h-screen bg-background pb-24">
      {/* Page Header */}
      <div className="px-6 lg:px-10 pt-8 pb-6 border-b border-border bg-card">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your company profile, round configuration, and preferences</p>
      </div>

      <div className="px-6 lg:px-10 py-8 max-w-3xl space-y-8">

        {/* ─── 0. Appearance ─── */}
        <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <SectionHeader title="Appearance" description="Choose how Capital OS looks on your device." />
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", icon: Sun, label: "Light Mode", desc: "Always light" },
              { value: "dark", icon: Moon, label: "Dark Mode", desc: "Always dark" },
              { value: "system", icon: Monitor, label: "System Default", desc: "Follows device" },
            ].map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                  theme === value
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                    : "border-border bg-background hover:border-violet-300 hover:bg-accent"
                }`}
              >
                <Icon className={`w-6 h-6 ${theme === value ? "text-violet-600" : "text-muted-foreground"}`} />
                <div className="text-center">
                  <p className={`text-xs font-semibold ${theme === value ? "text-violet-700 dark:text-violet-400" : "text-foreground"}`}>{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ─── 1. Company Profile ─── */}
        <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <SectionHeader title="Company Profile" description="Basic information displayed on your investor updates and data room." />
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Founder Name</Label>
                <Input value={form.founder_name} onChange={(e) => handleChange("founder_name", e.target.value)} className="mt-1.5" placeholder="Your full name" />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.founder_title} onChange={(e) => handleChange("founder_title", e.target.value)} className="mt-1.5" placeholder="CEO & Co-Founder" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input value={form.company_name} onChange={(e) => handleChange("company_name", e.target.value)} className="mt-1.5" placeholder="Acme Inc." />
              </div>
              <div>
                <Label>Website URL</Label>
                <Input value={form.website_url} onChange={(e) => handleChange("website_url", e.target.value)} className="mt-1.5" placeholder="https://yourcompany.com" />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="pt-4 border-t border-border">
              <Label className="mb-3 block">Company Logo</Label>
              <div className="flex items-center gap-5">
                {form.logo_url ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <label className="inline-block cursor-pointer px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    {form.logo_url ? "Change Logo" : "Upload Logo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <p className="text-xs text-slate-400 mt-2">Appears on updates and data room documents. PNG or SVG recommended.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. Round Configuration ─── */}
        <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#6D5DF6] uppercase tracking-wider">Round Configuration</h2>
              <p className="text-muted-foreground text-xs mt-1">Track your active fundraising round and capital commitments.</p>
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <span className="text-xs text-muted-foreground font-medium">{form.raise_mode ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => handleChange("raise_mode", !form.raise_mode)}
                className={`relative w-11 h-6 rounded-full transition-all ${form.raise_mode ? "bg-violet-600" : "bg-slate-200"}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.raise_mode ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>
          <div className="border-t border-border mb-5" />

          {form.raise_mode ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Primary Capital Type</Label>
                  <Select value={form.capital_type || ""} onValueChange={(v) => handleChange("capital_type", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {["Angel", "Family Office", "Venture Capital", "Private Equity", "Strategic/Corporate", "Mixed"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Round Type</Label>
                  <Select value={form.round_type || ""} onValueChange={(v) => handleChange("round_type", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select round" /></SelectTrigger>
                    <SelectContent>
                      {["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Target Raise ($)</Label>
                  <Input type="number" value={form.target_raise_amount} onChange={(e) => handleNumber("target_raise_amount", e.target.value)} className="mt-1.5" placeholder="0" />
                </div>
                <div>
                  <Label>Capital Committed ($)</Label>
                  <Input type="number" value={form.capital_committed} onChange={(e) => handleNumber("capital_committed", e.target.value)} className="mt-1.5" placeholder="0" />
                </div>
                <div>
                  <Label>Soft Commitments ($)</Label>
                  <Input type="number" value={form.soft_commitments} onChange={(e) => handleNumber("soft_commitments", e.target.value)} className="mt-1.5" placeholder="0" />
                </div>
              </div>
              <div className="sm:w-1/2">
                <Label>Target Close Date</Label>
                <Input type="date" value={form.target_close_date} onChange={(e) => handleChange("target_close_date", e.target.value)} className="mt-1.5" />
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">Enable fundraising tracking to configure your round details.</p>
            </div>
          )}
        </section>

        {/* ─── 3. Investor Update Preferences ─── */}
        <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <SectionHeader title="Investor Update Preferences" description="Control how your investor updates are sent and formatted." />
          <div className="space-y-5">
            <div>
              <Label>Update Signature</Label>
              <Textarea
                value={form.email_signature}
                onChange={(e) => handleChange("email_signature", e.target.value)}
                className="mt-1.5 min-h-[100px] font-sans text-sm leading-relaxed"
                placeholder={"Best regards,\nYour Name\nYour Title"}
              />
              <p className="text-xs text-slate-400 mt-1.5">Automatically appended to all outgoing investor updates.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Reply-To Email</Label>
                <Input value={form.reply_to_email} onChange={(e) => handleChange("reply_to_email", e.target.value)} className="mt-1.5" placeholder="you@yourcompany.com" type="email" />
              </div>
              <div>
                <Label>Default Update Cadence</Label>
                <Select value={form.update_cadence} onValueChange={(v) => handleChange("update_cadence", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Monthly", "Bi-Monthly", "Quarterly"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. Notifications ─── */}
        <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <SectionHeader title="Notifications" description="Choose which events trigger email notifications." />
          <div className="divide-y divide-border">
            <Toggle
              checked={form.notif_overdue_followup}
              onChange={(v) => handleChange("notif_overdue_followup", v)}
              label="Overdue Follow-up Alerts"
              description="Notify when an investor follow-up is past due."
            />
            <Toggle
              checked={form.notif_dataroom_views}
              onChange={(v) => handleChange("notif_dataroom_views", v)}
              label="Data Room View Notifications"
              description="Notify when an investor opens your data room link."
            />
            <Toggle
              checked={form.notif_update_reminders}
              onChange={(v) => handleChange("notif_update_reminders", v)}
              label="Investor Update Reminders"
              description="Remind you when it's time to send your next update."
            />
            <Toggle
              checked={form.notif_round_milestones}
              onChange={(v) => handleChange("notif_round_milestones", v)}
              label="Round Milestone Alerts"
              description="Notify when your round hits key commitment milestones."
            />
          </div>
        </section>

        {/* ─── 5. Billing ─── */}
        <BillingSection company={company} companyId={companyId} />

        {/* ─── 6. Account ─── */}
        <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <SectionHeader title="Account" />
          <div className="space-y-5">
            <div>
              <Label>Email Address</Label>
              <Input value={user?.email || "—"} readOnly className="mt-1.5 bg-slate-50 text-slate-500 cursor-default" />
              <p className="text-xs text-muted-foreground mt-1">Your login email cannot be changed here.</p>
            </div>
            <div>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => base44.auth.redirectToLogin()}
              >
                Change Password
              </Button>
            </div>

            {/* Danger Zone */}
            <div className="pt-5 border-t border-border">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700">Danger Zone</p>
                  <p className="text-xs text-red-500 mt-0.5 mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    onClick={() => window.confirm("Are you sure you want to delete your account? This cannot be undone.") && base44.auth.logout()}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ─── Sticky Save Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-6 py-4 flex justify-end">
        <Button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="bg-violet-600 hover:bg-violet-700 text-white px-8 h-10"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}