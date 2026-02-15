import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompany } from "../components/useCompany";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast, { Toaster } from "react-hot-toast";

export default function Settings() {
  const queryClient = useQueryClient();
  const { company, companyId, isLoading: companyLoading } = useCompany();

  const isLoading = companyLoading;

  const [form, setForm] = useState({
    company_name: "",
    founder_name: "",
    founder_title: "",
    email_signature: "",
    logo_url: "",
    raise_mode: false,
    capital_type: "",
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
        logo_url: company.logo_url || "",
        raise_mode: company.raise_mode || false,
        capital_type: company.capital_type || "",
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
        logo_url: formData.logo_url,
        raise_mode: formData.raise_mode,
        capital_type: formData.capital_type,
        target_raise_amount: formData.target_raise_amount,
        capital_committed: formData.capital_committed,
        soft_commitments: formData.soft_commitments,
        round_type: formData.round_type,
        target_close_date: formData.target_close_date,
      };
      
      if (!companyId) {
        throw new Error("No company ID found");
      }
      
      return base44.entities.Company.update(companyId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      toast.success("Settings saved successfully!");
    },
    onError: (error) => {
      toast.error("Failed to save settings: " + error.message);
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
      <Toaster position="top-right" />
      
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1.5">Manage your company profile and fundraising configuration</p>
      </div>

      <div className="space-y-10">
        {/* Company Profile */}
        <div className="glass rounded-xl p-7">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">Company Profile</h2>
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
            <div className="pt-6 border-t border-slate-200">
              <Label className="text-sm text-slate-700 mb-2">Company Logo</Label>
              <div className="flex items-start gap-5 mt-3">
                {form.logo_url ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <label className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium cursor-pointer transition-colors inline-block">
                    {form.logo_url ? "Change Logo" : "Upload Logo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">Your logo will appear on investor updates and<br />exported data room documents.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fundraising Configuration */}
        <div className="glass rounded-xl p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fundraising Configuration</h2>
              <p className="text-slate-500 text-xs mt-1.5">Configure active fundraising round and capital tracking</p>
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
            <div className="space-y-5 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Capital Type</Label>
                  <Select value={form.capital_type || ""} onValueChange={(v) => handleChange("capital_type", v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select capital type" />
                    </SelectTrigger>
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

        {/* Investor Update Signature */}
        <div className="glass rounded-xl p-7">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Investor Update Signature</h2>
          <p className="text-slate-500 text-xs mb-5">This signature will be automatically appended to your investor updates.</p>
          <Textarea
            value={form.email_signature}
            onChange={(e) => handleChange("email_signature", e.target.value)}
            className="min-h-[120px]"
            placeholder="Best regards,&#10;[Your Name]&#10;[Your Title]"
          />
        </div>

        {/* Save */}
        <div className="flex justify-end pt-4 pb-10">
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
    </div>
  );
}