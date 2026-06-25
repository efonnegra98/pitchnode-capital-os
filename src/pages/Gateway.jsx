import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "../utils";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5836-5.036-3.7109H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9574C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
    <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
  </svg>
);

function InputField({ label, type = "text", value, onChange, placeholder, error }) {
  return (
    <div className="w-full">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        autoComplete={type === "password" ? "current-password" : "email"}
        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-gray-500"
        style={{
          background: "#1a1a1a",
          border: `1px solid ${error ? "#ef4444" : "#2a2a2a"}`,
        }}
      />
      {error && <p className="mt-1 text-xs text-red-400 text-left">{error}</p>}
    </div>
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Sign In Form ──────────────────────────────────────────────────────────────
function SignInForm({ onSwitchToSignUp }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "verify"

  const validate = () => {
    const errs = {};
    if (!isValidEmail(email)) errs.email = "Invalid email address";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    return errs;
  };

  const handleSignIn = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      // After sign-in, check onboarding
      const profiles = await base44.entities.UserProfile.filter({ user_email: email });
      if (profiles.length === 0 || !profiles[0].onboarding_completed) {
        navigate(createPageUrl("Onboarding"));
      } else {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (err) {
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("not verified") || msg.includes("verify") || msg.includes("verification") || msg.includes("otp") || msg.includes("not confirmed")) {
        setStep("verify");
      } else if (msg.includes("not found") || msg.includes("no user") || msg.includes("user not found")) {
        setErrors({ email: "No account found with this email" });
      } else if (msg.includes("password") || msg.includes("invalid") || msg.includes("credentials") || msg.includes("wrong")) {
        setErrors({ password: "Incorrect password" });
      } else {
        setErrors({ password: "Incorrect password" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otpCode.trim()) {
      setErrors({ otp: "Enter the verification code from your email" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await base44.auth.verifyOtp({ email, otpCode });
      await base44.auth.loginViaEmailPassword(email, password);
      const profiles = await base44.entities.UserProfile.filter({ user_email: email });
      if (profiles.length === 0 || !profiles[0].onboarding_completed) {
        navigate(createPageUrl("Onboarding"));
      } else {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (err) {
      const msg = err?.message || "";
      setErrors({ otp: msg || "Invalid or expired code. Try again or resend." });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await base44.auth.resendOtp(email);
      setErrors({});
    } catch {
      setErrors({ otp: "Could not resend code. Try again in a moment." });
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isValidEmail(email)) {
      setErrors({ email: "Enter a valid email to reset your password" });
      return;
    }
    setResetLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
      setResetSent(true);
    } catch {
      setErrors({ email: "Could not send reset email. Check the address and try again." });
    } finally {
      setResetLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => setStep("form")} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
            ← Back
          </button>
          <p className="text-white font-semibold text-sm">Verify your email</p>
        </div>

        <p className="text-sm text-left" style={{ color: "#9ca3af" }}>
          Your email isn't verified yet. We sent a 6-digit code to <span className="text-white font-medium">{email}</span> — enter it below to finish signing in.
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none tracking-[0.5em] text-center text-lg"
          style={{ background: "#1a1a1a", border: `1px solid ${errors.otp ? "#ef4444" : "#2a2a2a"}` }}
        />
        {errors.otp && <p className="text-xs text-red-400 text-left">{errors.otp}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
          style={{ background: "#ffffff", color: "#0f0f0f" }}
        >
          {loading ? "Verifying…" : "Verify & Sign In"}
        </button>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs transition-colors hover:text-gray-300 disabled:opacity-50"
            style={{ color: "#6b7280" }}
          >
            {resending ? "Sending…" : "Didn't get the code? Resend"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <InputField
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <InputField
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full py-3.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
        style={{ background: "#ffffff", color: "#0f0f0f" }}
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>

      <button
        onClick={onSwitchToSignUp}
        className="w-full py-3.5 rounded-full text-sm font-semibold border transition-colors hover:bg-white/5"
        style={{ border: "1px solid #2a2a2a", color: "#ffffff" }}
      >
        Create Account
      </button>

      <div className="text-center">
        {resetSent ? (
          <p className="text-xs" style={{ color: "#22c55e" }}>Reset email sent — check your inbox.</p>
        ) : (
          <button
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="text-xs transition-colors hover:text-gray-300 disabled:opacity-50"
            style={{ color: "#6b7280" }}
          >
            {resetLoading ? "Sending…" : "Forgot your password?"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sign Up Form ──────────────────────────────────────────────────────────────
function SignUpForm({ onSwitchToSignIn }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "verify"

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!isValidEmail(email)) errs.email = "Invalid email address";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleCreate = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await base44.auth.register({ email, password, full_name: fullName });
      setStep("verify");
    } catch (err) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists")) {
        setErrors({ email: "An account with this email already exists" });
      } else {
        setErrors({ email: msg || "Could not create account. Try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otpCode.trim()) {
      setErrors({ otp: "Enter the verification code from your email" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await base44.auth.verifyOtp({ email, otpCode });
      await base44.auth.loginViaEmailPassword(email, password);
      navigate(createPageUrl("Onboarding"));
    } catch (err) {
      const msg = err?.message || "";
      setErrors({ otp: msg || "Invalid or expired code. Try again or resend." });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await base44.auth.resendOtp(email);
      setErrors({});
    } catch {
      setErrors({ otp: "Could not resend code. Try again in a moment." });
    } finally {
      setResending(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => setStep("form")} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
            ← Back
          </button>
          <p className="text-white font-semibold text-sm">Verify your email</p>
        </div>

        <p className="text-sm text-left" style={{ color: "#9ca3af" }}>
          We sent a 6-digit code to <span className="text-white font-medium">{email}</span>. Enter it below to activate your account.
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none tracking-[0.5em] text-center text-lg"
          style={{ background: "#1a1a1a", border: `1px solid ${errors.otp ? "#ef4444" : "#2a2a2a"}` }}
        />
        {errors.otp && <p className="text-xs text-red-400 text-left">{errors.otp}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
          style={{ background: "#ffffff", color: "#0f0f0f" }}
        >
          {loading ? "Verifying…" : "Verify & Continue"}
        </button>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs transition-colors hover:text-gray-300 disabled:opacity-50"
            style={{ color: "#6b7280" }}
          >
            {resending ? "Sending…" : "Didn't get the code? Resend"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onSwitchToSignIn} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
          ← Back
        </button>
        <p className="text-white font-semibold text-sm">Create your account</p>
      </div>

      <InputField
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />
      <InputField
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <InputField
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <InputField
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
      />

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full py-3.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
        style={{ background: "#ffffff", color: "#0f0f0f" }}
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </div>
  );
}

// ── Gateway Page ──────────────────────────────────────────────────────────────
export default function Gateway() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"

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

  const handleGoogleSignIn = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-4 sm:px-6 overflow-y-auto"
      style={{ background: "#0f0f0f" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center">

        {/* Wordmark */}
        <div className="mb-10 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Capital OS</h2>
          <p className="text-xs text-gray-500 mt-1.5">by PitchNode</p>
        </div>

        {mode === "signin" && (
          <>
            {/* Headline */}
            <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
              Your Fundraising Command Center.
            </h1>
            <p className="text-sm mb-10" style={{ color: "#9ca3af" }}>
              Built for serious founders.
            </p>
          </>
        )}

        {/* Email notice */}
        {mode === "signin" && (
          <p className="text-sm mb-6" style={{ color: "#9ca3af" }}>
            Sign in with your email and password below.{" "}
            <span style={{ color: "#6b7280" }}>Google sign-in coming soon.</span>
          </p>
        )}

        {/* Email/password section */}
        <div className="w-full">
          {mode === "signin" ? (
            <SignInForm onSwitchToSignUp={() => setMode("signup")} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setMode("signin")} />
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs" style={{ color: "#6b7280" }}>
          By continuing you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}