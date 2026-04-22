import React from "react";

const features = [
  "Investor CRM with sentiment tracking",
  "AI-drafted investor updates",
  "Shareable data room with access tracking",
  "Raise analytics & funnel visibility",
  "Command Center with priority signals",
];

export default function Upgrade() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        {/* Label */}
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
          Capital OS Pro
        </p>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 px-8 py-10">
          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Capital OS</h1>

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
          <a
            href="https://platformcapitalos.com/login"
            className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 rounded-full transition-colors"
          >
            Start Your 7-Day Free Trial
          </a>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-4">Cancel anytime.</p>
          <p className="text-center text-xs text-slate-400 mt-1">
            Included at no cost for PitchNode Accelerator companies.
          </p>
        </div>
      </div>
    </div>
  );
}