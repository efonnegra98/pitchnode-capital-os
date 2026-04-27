import React from "react";

const STRIPE_PAYMENT_URL = "https://buy.stripe.com/3cI00jf5Demc8vteLS7Zu00";

const features = [
  "Investor CRM with sentiment tracking",
  "AI-drafted investor updates",
  "Shareable data room with access tracking",
  "Raise analytics & funnel visibility",
  "Command Center with priority signals",
];

export default function Subscribe() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png"
            alt="PitchNode"
            className="h-9 w-auto mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-slate-900">Subscribe to CapitalOS</h1>
          <p className="text-slate-500 text-sm mt-2">
            Activate your account to access the CapitalOS platform.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-8">
          {/* Price */}
          <div className="text-center mb-6">
            <span className="text-4xl font-extrabold text-slate-900">$49</span>
            <span className="text-slate-400 text-base font-normal"> / month</span>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 text-[#6D5DF6] font-bold flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href={STRIPE_PAYMENT_URL}
            className="block w-full text-center bg-[#6D5DF6] hover:bg-[#5c4de0] text-white font-semibold text-sm py-3 rounded-lg transition-colors"
          >
            Subscribe Now
          </a>

          <p className="text-center text-xs text-slate-400 mt-4">
            Cancel anytime. Included at no cost for PitchNode Accelerator companies.
          </p>
        </div>
      </div>
    </div>
  );
}