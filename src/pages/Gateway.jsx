import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Gateway() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          // Already logged in — check if they have a profile
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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">PitchNode Capital OS</h1>
        </div>

        {/* Description */}
        <p className="text-xl text-slate-600 font-light leading-relaxed mb-12">
          Institutional infrastructure for disciplined capital raises.
        </p>

        {/* Primary CTA */}
        <Button
          onClick={handleSignIn}
          className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium text-base mb-4"
        >
          Sign in
        </Button>

        {/* Secondary Link */}
        <div className="mt-6">
          <Link
            to={createPageUrl("AccessRequest")}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Request access
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">
            Capital Grade · Built for Founders
          </p>
        </div>
      </div>
    </div>
  );
}