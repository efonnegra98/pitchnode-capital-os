import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "../utils";

const features = [
  { label: "Investor CRM", desc: "Track sentiment, cadence, and funnel stage" },
  { label: "AI Update Builder", desc: "Draft polished monthly updates in seconds" },
  { label: "Data Room", desc: "Share docs with access tracking built in" },
  { label: "Raise Analytics", desc: "Full funnel visibility and capital committed" },
];

export default function Gateway() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
          if (profiles.length === 0 || !profiles[0].onboarding_completed) {
            navigate(createPageUrl("Onboarding"));
          } else {
            navigate(createPageUrl("Dashboard"));
          }
        }
      } catch {
        // Not authenticated — stay on Gateway
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignIn = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Dark Brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden px-14 py-12"
        style={{ background: "linear-gradient(155deg, #0D0F1C 0%, #111827 60%, #0A0E1A 100%)" }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(109,93,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(109,93,246,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #6D5DF6 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #8B7FF6 0%, transparent 70%)" }} />

        {/* Logo */}
        <div className="relative z-10">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png"
            alt="PitchNode"
            className="h-9 w-auto brightness-0 invert"
          />
        </div>

        {/* Headline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-6 h-px bg-[#6D5DF6]" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#6D5DF6]">Capital OS</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-5" style={{ letterSpacing: "-0.02em" }}>
            Institutional infrastructure<br />for disciplined<br />capital raises.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Everything a founder needs to run a professional, high-signal fundraise — in one command center.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 w-4 h-4 rounded-full border border-[#6D5DF6]/40 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6D5DF6]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{f.label}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-[11px] text-slate-600 uppercase tracking-[0.18em]">Capital Grade · Built for Founders</p>
        </div>
      </div>

      {/* Right Panel — Sign In */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png"
            alt="PitchNode"
            className="h-8 w-auto"
          />
        </div>

        <div className="w-full max-w-[360px]">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ letterSpacing: "-0.02em" }}>
              Welcome back.
            </h2>
            <p className="text-slate-500 text-sm">
              Sign in to access your Capital OS dashboard.
            </p>
          </div>

          {/* Sign in button */}
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors shadow-sm mb-4"
          >
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Request access */}
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Don't have an account?</p>
            <Link
              to={createPageUrl("AccessRequest")}
              className="text-sm font-semibold text-[#6D5DF6] hover:text-[#5346E0] transition-colors"
            >
              Request access →
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-12 pt-6 border-t border-slate-100">
            <p className="text-center text-xs text-slate-400">
              Trusted by founders raising institutional capital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}