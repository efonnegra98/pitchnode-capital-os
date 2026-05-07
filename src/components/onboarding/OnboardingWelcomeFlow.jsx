import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Upload, X, Building2, Users, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: "Set up your company profile", icon: Building2 },
  { num: 2, label: "Add your first investor",      icon: Users    },
  { num: 3, label: "Upload your pitch deck",       icon: FileText },
];

const FIRM_TYPES = ["Venture Capital", "Angel", "Family Office", "Corporate / Strategic", "Accelerator", "Private Equity", "Other"];
const FUNNEL_STAGES = ["Identified", "Researching", "Outreach Sent", "Intro Call Scheduled", "Interest Confirmed", "Diligence"];

// ── Welcome screen ─────────────────────────────────────────────────────────────
function WelcomeScreen({ completedSteps, onGetStarted, onSkip }) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png"
          alt="PitchNode"
          className="h-9 w-auto mx-auto mb-8 brightness-0 invert"
        />
        <h1 className="text-3xl font-bold text-white mb-3">Welcome to Capital OS</h1>
        <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed">
          Let's get your raise set up in 3 steps. It takes less than 2 minutes.
        </p>
      </div>

      {/* Step cards */}
      <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
        {STEPS.map((step) => {
          const done = completedSteps.includes(step.num);
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                done
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? "bg-emerald-500" : "bg-white/10"
              }`}>
                {done
                  ? <Check className="w-4 h-4 text-white" />
                  : <span className="text-xs font-bold text-slate-400">{step.num}</span>
                }
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${done ? "text-emerald-400" : "text-white"}`}>
                  Step {step.num} — {step.label}
                </p>
              </div>
              <Icon className={`w-4 h-4 flex-shrink-0 ${done ? "text-emerald-400" : "text-slate-500"}`} />
            </div>
          );
        })}
      </div>

      <Button
        onClick={onGetStarted}
        className="w-full max-w-sm bg-violet-600 hover:bg-violet-500 text-white h-11 text-sm font-semibold"
      >
        Get Started <ArrowRight className="w-4 h-4 ml-1" />
      </Button>

      <button
        onClick={onSkip}
        className="mt-4 text-xs text-slate-500 hover:text-slate-400 transition-colors block mx-auto"
      >
        Skip setup — go to dashboard
      </button>
    </div>
  );
}

// ── Step 1 — Company Profile ───────────────────────────────────────────────────
function Step1CompanyProfile({ onSave, isSaving }) {
  const [form, setForm] = useState({
    company_name: "",
    industry: "",
    stage: "",
    target_raise_amount: "",
    website_url: "",
    description: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.company_name.trim() || !form.industry.trim() || !form.stage || !form.target_raise_amount || !form.description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    onSave(form);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Step 1 of 3</p>
        <h2 className="text-xl font-bold text-white">Company Profile</h2>
        <p className="text-slate-400 text-sm mt-1">Tell us about your company</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-slate-300 text-xs">Company Name <span className="text-red-400">*</span></Label>
          <Input
            value={form.company_name}
            onChange={(e) => { setForm(f => ({ ...f, company_name: e.target.value })); setError(""); }}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
            placeholder="Acme Inc."
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 text-xs">Industry / Sector <span className="text-red-400">*</span></Label>
            <Input
              value={form.industry}
              onChange={(e) => { setForm(f => ({ ...f, industry: e.target.value })); setError(""); }}
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
              placeholder="e.g. SaaS, FinTech"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-xs">Stage <span className="text-red-400">*</span></Label>
            <Select value={form.stage} onValueChange={(v) => { setForm(f => ({ ...f, stage: v })); setError(""); }}>
              <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white focus:ring-violet-500">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {["Pre-Seed", "Seed", "Series A"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-slate-300 text-xs">Raise Target ($) <span className="text-red-400">*</span></Label>
          <Input
            type="number"
            value={form.target_raise_amount}
            onChange={(e) => { setForm(f => ({ ...f, target_raise_amount: e.target.value })); setError(""); }}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
            placeholder="e.g. 1500000"
          />
        </div>

        <div>
          <Label className="text-slate-300 text-xs">Website URL <span className="text-slate-500">(optional)</span></Label>
          <Input
            value={form.website_url}
            onChange={(e) => setForm(f => ({ ...f, website_url: e.target.value }))}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
            placeholder="https://yourcompany.com"
          />
        </div>

        <div>
          <Label className="text-slate-300 text-xs">Short Description <span className="text-red-400">*</span></Label>
          <Textarea
            value={form.description}
            onChange={(e) => { setForm(f => ({ ...f, description: e.target.value })); setError(""); }}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 min-h-[70px]"
            placeholder="What does your company do in one sentence?"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSaving}
        className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white h-11 font-semibold"
      >
        {isSaving ? "Saving..." : "Save and Continue"}
        {!isSaving && <ArrowRight className="w-4 h-4 ml-1" />}
      </Button>
    </div>
  );
}

// ── Step 2 — Add First Investor ────────────────────────────────────────────────
function Step2AddInvestor({ onSave, onSkip, isSaving }) {
  const [form, setForm] = useState({
    firm: "",
    firm_type: "",
    name: "",
    funnel_stage: "Identified",
  });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.firm.trim()) {
      setError("Firm name is required.");
      return;
    }
    setError("");
    onSave(form);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Step 2 of 3</p>
        <h2 className="text-xl font-bold text-white">Add Your First Investor</h2>
        <p className="text-slate-400 text-sm mt-1">Add a firm you're targeting or already in talks with</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-slate-300 text-xs">Firm Name <span className="text-red-400">*</span></Label>
          <Input
            value={form.firm}
            onChange={(e) => { setForm(f => ({ ...f, firm: e.target.value })); setError(""); }}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
            placeholder="e.g. Sequoia Capital"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 text-xs">Firm Type</Label>
            <Select value={form.firm_type} onValueChange={(v) => setForm(f => ({ ...f, firm_type: v }))}>
              <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white focus:ring-violet-500">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {FIRM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 text-xs">Contact Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
              placeholder="Partner / GP"
            />
          </div>
        </div>

        <div>
          <Label className="text-slate-300 text-xs">Funnel Stage</Label>
          <Select value={form.funnel_stage} onValueChange={(v) => setForm(f => ({ ...f, funnel_stage: v }))}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white focus:ring-violet-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FUNNEL_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSaving}
        className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white h-11 font-semibold"
      >
        {isSaving ? "Saving..." : "Add Investor and Continue"}
        {!isSaving && <ArrowRight className="w-4 h-4 ml-1" />}
      </Button>

      <button
        onClick={onSkip}
        className="mt-3 text-xs text-slate-500 hover:text-slate-400 transition-colors block w-full text-center"
      >
        Skip for now
      </button>
    </div>
  );
}

// ── Step 3 — Upload Pitch Deck ──────────────────────────────────────────────────
function Step3UploadDeck({ onSave, onSkip, isSaving }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const accept = ".pdf,.ppt,.pptx";
  const maxMB = 50;

  const handleFile = (f) => {
    if (!f) return;
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > maxMB) { setError(`File exceeds ${maxMB}MB limit.`); return; }
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "ppt", "pptx"].includes(ext)) { setError("Please upload a PDF or PowerPoint file."); return; }
    setError("");
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Step 3 of 3</p>
        <h2 className="text-xl font-bold text-white">Upload Your Pitch Deck</h2>
        <p className="text-slate-400 text-sm mt-1">Upload your pitch deck to your data room</p>
      </div>

      {/* Drop zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          dragging
            ? "border-violet-400 bg-violet-500/10"
            : file
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-white/8"
        }`}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-400">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setFile(null); }}
              className="mt-2 text-xs text-slate-500 hover:text-slate-300 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-300 font-medium">Drop your deck here or click to browse</p>
            <p className="text-xs text-slate-500 mt-1">PDF or PowerPoint • Max {maxMB}MB</p>
          </div>
        )}
      </label>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      <Button
        onClick={() => { if (!file) { setError("Please select a file or skip."); return; } onSave(file); }}
        disabled={isSaving}
        className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white h-11 font-semibold"
      >
        {isSaving ? "Uploading..." : "Upload and Finish"}
        {!isSaving && <ArrowRight className="w-4 h-4 ml-1" />}
      </Button>

      <button
        onClick={onSkip}
        className="mt-3 text-xs text-slate-500 hover:text-slate-400 transition-colors block w-full text-center"
      >
        Skip for now
      </button>
    </div>
  );
}

// ── Success screen ─────────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6 animate-pulse">
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">You're ready to raise.</h2>
      <p className="text-slate-400 text-sm">Taking you to your dashboard…</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function OnboardingWelcomeFlow({ profile, user, companyId, onComplete }) {
  // screen: "welcome" | 1 | 2 | 3 | "success"
  const [screen, setScreen] = useState("welcome");
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(() => {
    const done = [];
    if (profile?.onboarding_profile_complete) done.push(1);
    if (profile?.onboarding_investor_added)   done.push(2);
    if (profile?.onboarding_deck_uploaded)    done.push(3);
    return done;
  });

  const markStep = (n) => setCompletedSteps(prev => prev.includes(n) ? prev : [...prev, n]);

  const updateProfile = useCallback(async (fields) => {
    if (!profile?.id) return;
    await base44.entities.UserProfile.update(profile.id, fields);
  }, [profile?.id]);

  const handleSkipAll = async () => {
    await updateProfile({ onboarding_shown: true });
    onComplete();
  };

  const handleGetStarted = () => setScreen(1);

  // Step 1 save
  const handleSaveProfile = async (formData) => {
    setSaving(true);
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 7);

    let cid = companyId;
    if (!cid) {
      const company = await base44.entities.Company.create({
        name: formData.company_name,
        raise_mode: true,
        target_raise_amount: Number(formData.target_raise_amount) || null,
        round_type: formData.stage || null,
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        subscription_status: "trialing",
      });
      cid = company.id;
    } else {
      await base44.entities.Company.update(cid, {
        name: formData.company_name,
        raise_mode: true,
        target_raise_amount: Number(formData.target_raise_amount) || null,
        round_type: formData.stage || null,
      });
    }

    await updateProfile({
      company_id: cid,
      onboarding_profile_complete: true,
      onboarding_shown: true,
      onboarding_started_date: now.toISOString(),
    });

    markStep(1);
    setSaving(false);
    setScreen(2);
  };

  // Step 2 save
  const handleSaveInvestor = async (formData) => {
    setSaving(true);
    const cid = companyId || profile?.company_id;
    await base44.entities.Investor.create({ ...formData, company_id: cid });
    await updateProfile({ onboarding_investor_added: true });
    markStep(2);
    setSaving(false);
    setScreen(3);
  };

  // Step 2 skip
  const handleSkipInvestor = async () => {
    await updateProfile({ onboarding_shown: true });
    setScreen(3);
  };

  // Step 3 save
  const handleSaveDeck = async (file) => {
    setSaving(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const cid = companyId || profile?.company_id;

    // Save to RaiseReadinessItem as "Pitch Deck"
    const existing = await base44.entities.RaiseReadinessItem.filter({ company_id: cid, item_name: "Pitch Deck" });
    if (existing[0]) {
      await base44.entities.RaiseReadinessItem.update(existing[0].id, {
        file_url,
        file_name: file.name,
        file_uploaded_date: new Date().toISOString(),
        status: "Complete",
      });
    } else {
      await base44.entities.RaiseReadinessItem.create({
        company_id: cid,
        item_name: "Pitch Deck",
        file_url,
        file_name: file.name,
        file_uploaded_date: new Date().toISOString(),
        status: "Complete",
        order: 1,
      });
    }

    await updateProfile({ onboarding_deck_uploaded: true, onboarding_completed: true });
    markStep(3);
    setSaving(false);
    setScreen("success");
    setTimeout(() => onComplete(), 2000);
  };

  // Step 3 skip
  const handleSkipDeck = async () => {
    await updateProfile({ onboarding_completed: true });
    setScreen("success");
    setTimeout(() => onComplete(), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl p-8">
        {/* Close / skip entirely — only on welcome screen */}
        {screen === "welcome" && (
          <button
            onClick={handleSkipAll}
            className="absolute top-4 right-4 text-slate-600 hover:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Step progress indicator — shown on steps 1-3 */}
        {typeof screen === "number" && (
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  completedSteps.includes(n)
                    ? "bg-emerald-500 text-white"
                    : n === screen
                    ? "bg-violet-600 text-white"
                    : "bg-white/10 text-slate-500"
                }`}>
                  {completedSteps.includes(n) ? <Check className="w-3 h-3" /> : n}
                </div>
                {n < 3 && <div className={`flex-1 h-px w-8 ${n < screen ? "bg-violet-600" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
        )}

        {screen === "welcome" && (
          <WelcomeScreen
            completedSteps={completedSteps}
            onGetStarted={handleGetStarted}
            onSkip={handleSkipAll}
          />
        )}
        {screen === 1 && <Step1CompanyProfile onSave={handleSaveProfile} isSaving={saving} />}
        {screen === 2 && <Step2AddInvestor onSave={handleSaveInvestor} onSkip={handleSkipInvestor} isSaving={saving} />}
        {screen === 3 && <Step3UploadDeck onSave={handleSaveDeck} onSkip={handleSkipDeck} isSaving={saving} />}
        {screen === "success" && <SuccessScreen />}
      </div>
    </div>
  );
}