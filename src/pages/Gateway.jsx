import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5836-5.036-3.7109H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9574C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#0f0f0f" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center">

        {/* Wordmark */}
        <div className="mb-10 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Capital OS</h2>
          <p className="text-xs text-gray-500 mt-1.5">by PitchNode</p>
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
          Your Fundraising Command Center.
        </h1>

        {/* Subtitle */}
        <p className="text-sm mb-10" style={{ color: "#9ca3af" }}>
          Built for serious founders.
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 font-semibold text-sm py-3.5 rounded-full transition-colors"
            style={{ color: "#1d1d1f" }}
          >
            <GoogleIcon />
            Sign In with Google
          </button>

          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 font-semibold text-sm py-3.5 rounded-full transition-colors"
            style={{ color: "#1d1d1f" }}
          >
            <GoogleIcon />
            Create Account
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs" style={{ color: "#6b7280" }}>
          By continuing you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}