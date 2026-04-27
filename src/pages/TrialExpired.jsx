import React from "react";

const STRIPE_PAYMENT_URL = "https://buy.stripe.com/3cI00jf5Demc8vteLS7Zu00";

const features = [
  "Investor CRM with sentiment tracking",
  "AI-drafted investor updates",
  "Shareable data room with access tracking",
  "Raise analytics & funnel visibility",
  "Command Center with priority signals",
];

export default function TrialExpired() {
  const handleSubscribe = () => {
    window.location.href = STRIPE_PAYMENT_URL;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        {/* Headline */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your 7-Day Trial Has Ended.</h1>
          <p className="text-slate-500 text-sm">Subscribe to keep full access to your investor CRM, data room, and raise analytics.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 px-8 py-10">

          {/* Card Title */}
          <h2 className="text-center text-lg font-bold text-slate-900 mb-4">Capital OS</h2>

          {/* Price */}
          <div className="text-center mt-4 mb-2">
            <span className="text-5xl font-extrabold text-slate-900">$49</span>
            <span className="text-slate-400 text-lg font-normal"> / month</span>
          </div>

          {/* Subtext */}
          <p className="text-center text-slate-500 text-sm mb-8">
            Operate your raise with structure and control.
          </p>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 text-slate-900 font-bold flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 rounded-full transition-colors"
          >
            Subscribe Now
          </button>
          <p className="text-center text-xs text-slate-500 mt-3">
            Continue managing your raise without interruption.
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-3">Cancel anytime.</p>
          <p className="text-center text-xs text-slate-400 mt-1">
            Included at no cost for PitchNode Accelerator companies.
          </p>
        </div>
      </div>
    </div>
  );
}