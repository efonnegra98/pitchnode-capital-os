import React from "react";
import { Check, X, Building2, Users, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const STEPS = [
  {
    num: 1,
    key: "onboarding_profile_complete",
    icon: Building2,
    doneLabel: "Company profile set up",
    todoLabel: "Complete your company profile",
    link: null, // handled inline
  },
  {
    num: 2,
    key: "onboarding_investor_added",
    icon: Users,
    doneLabel: "First investor added",
    todoLabel: "Add your first investor to start tracking your pipeline",
    link: "Investors",
  },
  {
    num: 3,
    key: "onboarding_deck_uploaded",
    icon: FileText,
    doneLabel: "Pitch deck uploaded",
    todoLabel: "Upload your pitch deck to complete your data room",
    link: "Dashboard",
  },
];

export default function OnboardingProgressBanner({ profile, onDismiss }) {
  if (!profile) return null;

  // Hide if all steps done
  const allDone =
    profile.onboarding_profile_complete &&
    profile.onboarding_investor_added &&
    profile.onboarding_deck_uploaded;

  // Hide if dismissed
  if (profile.onboarding_banner_dismissed) return null;

  // Hide if all done
  if (allDone) return null;

  // Hide after 7 days from started date
  if (profile.onboarding_started_date) {
    const started = new Date(profile.onboarding_started_date);
    const daysSince = (new Date() - started) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) return null;
  }

  return (
    <div className="bg-violet-950/40 border-b border-violet-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-start gap-4">
        {/* Steps */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-wrap">
          <p className="text-xs font-semibold text-violet-300 whitespace-nowrap">Setup checklist</p>
          {STEPS.map((step) => {
            const done = !!profile[step.key];
            const Icon = step.icon;
            return (
              <div key={step.num} className="flex items-center gap-2 min-w-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? "bg-emerald-500" : "bg-white/10"
                }`}>
                  {done
                    ? <Check className="w-3 h-3 text-white" />
                    : <span className="text-[10px] text-slate-400 font-bold">{step.num}</span>
                  }
                </div>
                {done ? (
                  <span className="text-xs text-slate-400 line-through">{step.doneLabel}</span>
                ) : step.link ? (
                  <Link
                    to={createPageUrl(step.link)}
                    className="text-xs text-violet-300 hover:text-violet-200 flex items-center gap-1 transition-colors"
                  >
                    {step.todoLabel}
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                  </Link>
                ) : (
                  <span className="text-xs text-violet-300">{step.todoLabel}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}