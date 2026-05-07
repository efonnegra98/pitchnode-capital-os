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
    <div
      className="border-b px-4 py-3"
      style={{
        backgroundColor: "var(--banner-bg, #f8f7ff)",
        borderColor: "var(--banner-border, #d4d0f0)",
      }}
    >
      <style>{`
        :root { --banner-bg: #f8f7ff; --banner-border: #d4d0f0; --banner-title: #4a4580; --banner-text: #333333; --banner-link: #5b52d6; --banner-circle: #c4c0e8; --banner-done: #999; }
        .dark { --banner-bg: transparent; --banner-border: rgba(139,92,246,0.2); --banner-title: rgb(196,181,253); --banner-text: rgb(148,163,184); --banner-link: rgb(196,181,253); --banner-circle: rgba(255,255,255,0.1); --banner-done: rgb(100,116,139); }
      `}</style>
      <div className="max-w-7xl mx-auto flex items-start gap-4">
        {/* Steps */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-wrap">
          <p className="text-xs font-semibold whitespace-nowrap" style={{ color: "var(--banner-title)" }}>Setup checklist</p>
          {STEPS.map((step) => {
            const done = !!profile[step.key];
            return (
              <div key={step.num} className="flex items-center gap-2 min-w-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: done ? "#22c55e" : "var(--banner-circle)",
                    border: done ? "none" : "1px solid var(--banner-circle)",
                  }}
                >
                  {done
                    ? <Check className="w-3 h-3 text-white" />
                    : <span className="text-[10px] font-bold" style={{ color: "var(--banner-title)" }}>{step.num}</span>
                  }
                </div>
                {done ? (
                  <span className="text-xs line-through" style={{ color: "var(--banner-done)" }}>{step.doneLabel}</span>
                ) : step.link ? (
                  <Link
                    to={createPageUrl(step.link)}
                    className="text-xs flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{ color: "var(--banner-link)" }}
                  >
                    {step.todoLabel}
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                  </Link>
                ) : (
                  <span className="text-xs" style={{ color: "var(--banner-text)" }}>{step.todoLabel}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="transition-colors flex-shrink-0 mt-0.5 hover:opacity-60"
          style={{ color: "var(--banner-done)" }}
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}