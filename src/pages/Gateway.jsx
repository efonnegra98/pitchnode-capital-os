import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "../utils";

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
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0f0f1a 50%, #1a1a2e 100%)" }}
    >
      {/* Glow orbs */}
      <div className="absolute top-[-200px] left-[-150px] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(109,93,246,0.12) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,127,246,0.08) 0%, transparent 70%)" }} />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(109,93,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(109,93,246,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm">

        {/* Logo */}
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png"
          alt="PitchNode"
          className="h-9 w-auto brightness-0 invert mb-10"
        />

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-5">
          <span className="w-5 h-px bg-[#6D5DF6]" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#6D5DF6]">Capital OS</span>
          <span className="w-5 h-px bg-[#6D5DF6]" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
          Institutional infrastructure<br />for disciplined raises.
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-10">
          Your command center for running a high-signal, founder-grade capital raise.
        </p>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm py-3.5 rounded-xl transition-colors shadow-lg mb-4"
        >
          Sign in
        </button>

        {/* Request access */}
        <Link
          to={createPageUrl("AccessRequest")}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Request access →
        </Link>

        {/* Footer */}
        <p className="mt-14 text-[11px] text-slate-700 uppercase tracking-[0.2em]">
          Capital Grade · Built for Founders
        </p>
      </div>
    </div>
  );
}