import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Save } from "lucide-react";

const INDUSTRIES = ["SaaS", "Fintech", "HealthTech", "EdTech", "E-commerce", "AI/ML", "Marketplace", "Consumer", "B2B", "Deep Tech", "Climate Tech", "Other"];
const RAISE_STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];
const ROUND_TYPES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];

function Card({ children }) {
  return <div className="bg-card border border-border rounded-2xl p-6 lg:p-7 shadow-sm">{children}</div>;
}

function SectionTitle({ children, description }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}

export default function CompanyTab({ company, companyId, toast }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    company_name: "",
    website_url: "",
    industry: "",
    logo_url: "",
    round_type: "",
    target_raise_amount: "",
    target_close_date: "",
    pre_money_valuation: "",
    raise_mode: false,
  });

  useEffect(() => {
    if (company) {
      setForm({
        company_name: company.name || "",
        website_url: company.website_url || "",
        industry: company.industry || "",
        logo_url: company.logo_url || "",
        round_type: company.round_type || "",
        target_raise_amount: company.target_raise_amount || "",
        target_close_date: company.target_close_date || "",
        pre_money_valuation: company.pre_money_valuation || "",
        raise_mode: company.raise_mode || false,
      });
    }
  }, [company]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const postMoney = form.pre_money_valuation && form.target_raise_amount
    ? (parseFloat(form.pre_money_valuation) + parseFloat(form.target_raise_amount)).toLocaleString()
    : null;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const toNum = v => (v === "" || v == null) ? null : parseFloat(v) || 0;
      await base44.entities.Company.update(companyId, {
        name: form.company_name,
        website_url: form.website_url,
        industry: form.industry || undefined,
        logo_url: form.logo_url,
        round_type: form.round_type || undefined,
        target_raise_amount: toNum(form.target_raise_amount),
        target_close_date: form.target_close_date || undefined,
        pre_money_valuation: toNum(form.pre_money_valuation),
        raise_mode: form.raise_mode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      toast({ title: "Company settings saved" });
    },
    onError: (err) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("logo_url", file_url);
  };

  return (
    <div className="space-y-6">
      {/* Company Profile */}
      <Card>
        <SectionTitle description="Basic information shown on investor updates and your data room.">
          Company Profile
        </SectionTitle>

        {/* Logo */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
          {form.logo_url ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-border flex items-center justify-center bg-muted flex-shrink-0">
              <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <label className="inline-block cursor-pointer px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors">
              {form.logo_url ? "Change Logo" : "Upload Logo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            <p className="text-xs text-muted-foreground mt-1.5">PNG or SVG recommended</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input value={form.company_name} onChange={e => set("company_name", e.target.value)} className="mt-1.5" placeholder="Acme Inc." />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input value={form.website_url} onChange={e => set("website_url", e.target.value)} className="mt-1.5" placeholder="https://yourcompany.com" />
            </div>
          </div>
          <div>
            <Label>Industry Sector</Label>
            <Select value={form.industry || ""} onValueChange={v => set("industry", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Raise Stage</Label>
            <Select value={form.round_type || ""} onValueChange={v => set("round_type", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select stage" /></SelectTrigger>
              <SelectContent>
                {RAISE_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Raise Target ($)</Label>
            <Input type="number" value={form.target_raise_amount} onChange={e => set("target_raise_amount", e.target.value)} className="mt-1.5" placeholder="e.g. 2000000" />
          </div>
        </div>
      </Card>

      {/* Round Configuration */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Round Configuration</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Track your active fundraising round.</p>
          </div>
          <button
            type="button"
            data-no-touch-target
            onClick={() => set("raise_mode", !form.raise_mode)}
            className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${form.raise_mode ? "bg-violet-600" : "bg-muted"}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.raise_mode ? "translate-x-5" : ""}`} />
          </button>
        </div>

        {form.raise_mode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Current Round Type</Label>
                <Select value={form.round_type || ""} onValueChange={v => set("round_type", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select round" /></SelectTrigger>
                  <SelectContent>
                    {ROUND_TYPES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Close Date</Label>
                <Input type="date" value={form.target_close_date} onChange={e => set("target_close_date", e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Pre-Money Valuation ($)</Label>
                <Input type="number" value={form.pre_money_valuation} onChange={e => set("pre_money_valuation", e.target.value)} className="mt-1.5" placeholder="e.g. 8000000" />
              </div>
              <div>
                <Label>Post-Money Valuation ($)</Label>
                <Input
                  value={postMoney ? `$${postMoney}` : "Auto-calculated"}
                  readOnly
                  className="mt-1.5 bg-muted text-muted-foreground cursor-default"
                />
                {postMoney && <p className="text-xs text-muted-foreground mt-1">Pre-money + raise target</p>}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">Enable raise tracking to configure your round details.</p>
        )}
      </Card>

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto"
      >
        <Save className="w-4 h-4 mr-2" />
        {saveMutation.isPending ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}