import React, { useState } from "react";
import { Check, X, Building2, Users, FileText, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const STEPS = [
  {
    num: 1,
    key: "onboarding_profile_complete",
    icon: Building2,
    doneLabel: "Company profile set up",
    todoLabel: "Complete your company profile",
    link: null,
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
  const [expanded, setExpanded] = useState(false);

  if (!profile) return null;

  const allDone =
    profile.onboarding_profile_complete &&
    profile.onboarding_investor_added &&
    profile.onboarding_deck_uploaded;

  if (profile.onboarding_banner_dismissed) return null;
  if (allDone) return null;

  if (profile.onboarding_started_date) {
    const started = new Date(profile.onboarding_started_date);
    const daysSince = (new Date() - started) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) return null;
  }

  const completedCount = STEPS.filter(s => !!profile[s.key]).length;
  const currentStep = STEPS.find(s => !profile[s.key]);

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

      {/* Mobile collapsed view */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            className="flex-1 flex items-center gap-3 text-left min-w-0"
            onClick={() => setExpanded(e => !e)}
          >
            <div className="flex-shrink-0">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--banner-circle)", color: "var(--banner-title)" }}>
                {completedCount}/{STEPS.length}
              </span>
            </div>
            {currentStep && !expanded && (
              <span className="text-xs truncate" style={{ color: "var(--banner-text)" }}>
                {currentStep.todoLabel}
              </span>
            )}
            {expanded && (
              <span className="text-xs font-semibold" style={{ color: "var(--banner-title)" }}>Setup checklist</span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
              style={{ color: "var(--banner-done)" }}
            />
          </button>
          <button onClick={onDismiss} className="flex-shrink-0 hover:opacity-60" style={{ color: "var(--banner-done)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded steps on mobile */}
        {expanded && (
          <div className="mt-3 space-y-2">
            {STEPS.map((step) => {
              const done = !!profile[step.key];
              return (
                <div key={step.num} className="flex items-center gap-2">
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
                      className="text-xs flex items-center gap-1"
                      style={{ color: "var(--banner-link)" }}
                    >
                      {step.todoLabel} <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    </Link>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--banner-text)" }}>{step.todoLabel}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop full view */}
      <div className="hidden sm:flex items-start gap-4 max-w-7xl mx-auto">
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