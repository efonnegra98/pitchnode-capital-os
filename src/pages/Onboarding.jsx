import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Plus, X } from "lucide-react";
import { createPageUrl } from "../utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [investors, setInvestors] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [companyForm, setCompanyForm] = useState({
    company_name: "",
    founder_name: "",
    founder_title: "",
    capital_type: "",
    raise_mode: false,
    target_raise_amount: "",
    round_type: "",
  });

  const [investorForm, setInvestorForm] = useState({
    name: "",
    firm: "",
    email: "",
    status: "Warm",
  });

  const [updateForm, setUpdateForm] = useState({
    month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    revenue: "",
    burn_rate: "",
    highlights: "",
  });

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const createCompanyMutation = useMutation({
    mutationFn: (data) => base44.entities.Company.create(data),
    onSuccess: (company) => {
      setCompanyId(company.id);
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Company.update(id, data),
  });

  const createInvestorMutation = useMutation({
    mutationFn: (data) => base44.entities.Investor.create(data),
  });

  const createUpdateMutation = useMutation({
    mutationFn: (data) => base44.entities.MonthlyUpdate.create(data),
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles[0]) {
        return base44.entities.UserProfile.update(profiles[0].id, { onboarding_completed: true });
      }
    },
    onSuccess: () => {
      navigate(createPageUrl("Dashboard"));
    },
  });

  const progress = (step / 4) * 100;

  const handleStep1Next = async () => {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 7);
    
    const company = await createCompanyMutation.mutateAsync({
      name: companyForm.company_name,
      founder_name: companyForm.founder_name,
      founder_title: companyForm.founder_title,
      capital_type: companyForm.capital_type,
      trial_start_date: now.toISOString(),
      trial_end_date: trialEnd.toISOString(),
      subscription_status: "trialing",
    });
    
    // Create UserProfile linked to company
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (profiles[0]) {
      await base44.entities.UserProfile.update(profiles[0].id, { company_id: company.id });
    } else {
      await base44.entities.UserProfile.create({
        user_email: user.email,
        company_id: company.id,
        approved: true,
        onboarding_completed: false,
      });
    }
    
    setStep(2);
  };

  const handleStep2Next = async () => {
    await updateCompanyMutation.mutateAsync({
      id: companyId,
      data: {
        raise_mode: companyForm.raise_mode,
        target_raise_amount: Number(companyForm.target_raise_amount) || null,
        round_type: companyForm.round_type || null,
      }
    });
    setStep(3);
  };

  const handleAddInvestor = async () => {
    if (!investorForm.name || !companyId) return;
    await createInvestorMutation.mutateAsync({ ...investorForm, company_id: companyId });
    setInvestors([...investors, investorForm]);
    setInvestorForm({ name: "", firm: "", email: "", status: "Warm" });
  };

  const handleStep3Next = () => {
    setStep(4);
  };

  const handleStep4Next = async () => {
    if (updateForm.month && companyId) {
      await createUpdateMutation.mutateAsync({
        ...updateForm,
        company_id: companyId,
        revenue: Number(updateForm.revenue) || null,
        burn_rate: Number(updateForm.burn_rate) || null,
        status: "draft",
      });
    }
    await completeOnboardingMutation.mutateAsync();
  };

  const handleSkip = () => {
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png"
              alt="PitchNode"
              className="h-10 w-auto"
            />
            <h1 className="text-2xl font-bold text-slate-900">Get Started</h1>
          </div>
          <p className="text-slate-600">Set up your Capital OS in under 10 minutes</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Step {step} of 4</p>
            <p className="text-sm text-slate-500">{Math.round(progress)}%</p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Company Profile</h2>
              <p className="text-slate-600 text-sm mb-6">Tell us about your company</p>
              <div className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                    className="mt-1.5 bg-white"
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <Label>Your Name</Label>
                  <Input
                    value={companyForm.founder_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, founder_name: e.target.value })}
                    className="mt-1.5 bg-white"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <Label>Your Title</Label>
                  <Input
                    value={companyForm.founder_title}
                    onChange={(e) => setCompanyForm({ ...companyForm, founder_title: e.target.value })}
                    className="mt-1.5 bg-white"
                    placeholder="CEO & Founder"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleStep1Next} className="bg-slate-900 hover:bg-slate-800 gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Capital Configuration</h2>
              <p className="text-slate-600 text-sm mb-6">Are you actively raising capital?</p>
              <div className="space-y-4">
                <div>
                  <Label>Enable Raise Mode</Label>
                  <Select
                    value={companyForm.raise_mode ? "yes" : "no"}
                    onValueChange={(v) => setCompanyForm({ ...companyForm, raise_mode: v === "yes" })}
                  >
                    <SelectTrigger className="mt-1.5 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I'm raising</SelectItem>
                      <SelectItem value="no">Not yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {companyForm.raise_mode && (
                  <>
                    <div>
                      <Label>Primary Capital Type</Label>
                      <Select
                        value={companyForm.capital_type}
                        onValueChange={(v) => setCompanyForm({ ...companyForm, capital_type: v })}
                      >
                        <SelectTrigger className="mt-1.5 bg-white">
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
                      <Select
                        value={companyForm.round_type}
                        onValueChange={(v) => setCompanyForm({ ...companyForm, round_type: v })}
                      >
                        <SelectTrigger className="mt-1.5 bg-white">
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
                      <Label>Target Raise Amount ($)</Label>
                      <Input
                        type="number"
                        value={companyForm.target_raise_amount}
                        onChange={(e) => setCompanyForm({ ...companyForm, target_raise_amount: e.target.value })}
                        className="mt-1.5 bg-white"
                        placeholder="1000000"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleStep2Next} className="bg-slate-900 hover:bg-slate-800 gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Add Investors</h2>
              <p className="text-slate-600 text-sm mb-6">Add your first investors ({investors.length}/5)</p>
              
              {investors.length > 0 && (
                <div className="mb-4 space-y-2">
                  {investors.map((inv, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium">{inv.name}</span>
                      <span className="text-sm text-slate-500">· {inv.firm}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      value={investorForm.name}
                      onChange={(e) => setInvestorForm({ ...investorForm, name: e.target.value })}
                      className="bg-white"
                      placeholder="Investor name"
                    />
                  </div>
                  <div>
                    <Input
                      value={investorForm.firm}
                      onChange={(e) => setInvestorForm({ ...investorForm, firm: e.target.value })}
                      className="bg-white"
                      placeholder="Firm name"
                    />
                  </div>
                </div>
                <Button onClick={handleAddInvestor} variant="outline" className="w-full gap-2">
                  <Plus className="w-4 h-4" /> Add Investor
                </Button>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleSkip}>Skip</Button>
                  <Button onClick={handleStep3Next} className="bg-slate-900 hover:bg-slate-800 gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">First Update</h2>
              <p className="text-slate-600 text-sm mb-6">Create your first investor update (optional)</p>
              <div className="space-y-4">
                <div>
                  <Label>Month</Label>
                  <Input
                    value={updateForm.month}
                    onChange={(e) => setUpdateForm({ ...updateForm, month: e.target.value })}
                    className="mt-1.5 bg-white"
                    placeholder="January 2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Revenue ($)</Label>
                    <Input
                      type="number"
                      value={updateForm.revenue}
                      onChange={(e) => setUpdateForm({ ...updateForm, revenue: e.target.value })}
                      className="mt-1.5 bg-white"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <Label>Burn Rate ($)</Label>
                    <Input
                      type="number"
                      value={updateForm.burn_rate}
                      onChange={(e) => setUpdateForm({ ...updateForm, burn_rate: e.target.value })}
                      className="mt-1.5 bg-white"
                      placeholder="30000"
                    />
                  </div>
                </div>
                <div>
                  <Label>Key Highlights</Label>
                  <Textarea
                    value={updateForm.highlights}
                    onChange={(e) => setUpdateForm({ ...updateForm, highlights: e.target.value })}
                    className="mt-1.5 bg-white h-20"
                    placeholder="Share your progress..."
                  />
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => completeOnboardingMutation.mutate()}>Skip</Button>
                  <Button onClick={handleStep4Next} className="bg-slate-900 hover:bg-slate-800 gap-2">
                    Complete Setup <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}