import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Section = ({ id, title, children }) => (
  <section id={id} className="mb-10">
    <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">{title}</h2>
    <div className="space-y-3 text-slate-700 leading-relaxed text-[15px]">{children}</div>
  </section>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-sm font-semibold text-slate-800">Privacy Policy</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Title block */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png"
              alt="PitchNode"
              className="h-8 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500">
            <strong>Effective Date:</strong> May 1, 2026 &nbsp;·&nbsp;
            <strong>Company:</strong> PitchNode LLC
          </p>
          <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
            At PitchNode, we take your privacy seriously. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data when you use the PitchNode platform.
          </p>
        </div>

        {/* TOC */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Table of Contents</p>
          <ol className="space-y-1.5 text-[14px]">
            {[
              ["collect", "Information We Collect"],
              ["use", "How We Use Your Information"],
              ["storage", "Data Storage & Security"],
              ["third-party", "Third-Party Services"],
              ["retention", "Data Retention"],
              ["rights", "Your Rights"],
              ["cookies", "Cookies & Tracking"],
              ["children", "Children's Privacy"],
              ["changes", "Changes to This Policy"],
              ["contact", "Contact Information"],
            ].map(([id, label], i) => (
              <li key={id}>
                <a href={`#${id}`} className="text-violet-600 hover:text-violet-800 transition-colors">
                  {i + 1}. {label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        <Section id="collect" title="1. Information We Collect">
          <p>We collect information you provide directly to us and information generated through your use of the Service.</p>

          <p className="font-semibold text-slate-800 !mt-4">Account & Identity Information</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Full name and email address</li>
            <li>Password (stored in hashed, non-readable form)</li>
            <li>Profile information such as your role (e.g., Founder)</li>
          </ul>

          <p className="font-semibold text-slate-800 !mt-4">Company Information</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Company name, logo, and founding details</li>
            <li>Fundraising details such as round type, target raise amount, and pre-money valuation</li>
            <li>Financial metrics including revenue, burn rate, and runway</li>
          </ul>

          <p className="font-semibold text-slate-800 !mt-4">Investor & CRM Data</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Names, emails, and firm information of investors you track</li>
            <li>Notes, activity logs, and communication records you enter</li>
            <li>Documents and files you upload to your data room</li>
          </ul>

          <p className="font-semibold text-slate-800 !mt-4">Usage & Technical Data</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pages visited, features used, and actions taken within the platform</li>
            <li>Browser type, operating system, and device information</li>
            <li>IP address and general geographic location</li>
            <li>Session timestamps and duration</li>
          </ul>

          <p className="font-semibold text-slate-800 !mt-4">Billing Information</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Subscription status and billing history</li>
            <li>Payment details are handled directly by Stripe — we do not store full card numbers</li>
          </ul>
        </Section>

        <Section id="use" title="2. How We Use Your Information">
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>To provide and operate the Service</strong> — including managing your account, storing your investor CRM data, and enabling platform features.</li>
            <li><strong>To process payments</strong> — via Stripe to manage your subscription, billing, and trial status.</li>
            <li><strong>To send trial and onboarding communications</strong> — including welcome emails, trial expiry reminders, and subscription confirmations.</li>
            <li><strong>To improve the platform</strong> — by analyzing usage patterns to understand how features are used and where we can improve.</li>
            <li><strong>To provide customer support</strong> — responding to questions, troubleshooting issues, and managing support requests.</li>
            <li><strong>To comply with legal obligations</strong> — where required by applicable law or regulation.</li>
          </ul>
          <p>We will not use your data for advertising purposes or sell it to third parties.</p>
        </Section>

        <Section id="storage" title="3. Data Storage & Security">
          <p>
            Your data is stored on secure cloud infrastructure. We implement commercially reasonable technical and organizational security measures to protect your information from unauthorized access, disclosure, alteration, or destruction.
          </p>
          <p>These measures include:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Encrypted data transmission using HTTPS/TLS</li>
            <li>Access controls limiting who within our team can view user data</li>
            <li>Secure authentication mechanisms including hashed password storage</li>
            <li>Regular security reviews of our infrastructure and practices</li>
          </ul>
          <p>
            While we take data security seriously, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data, and you use the Service at your own risk.
          </p>
        </Section>

        <Section id="third-party" title="4. Third-Party Services">
          <p>We work with a limited set of trusted third-party providers to operate the Service. These providers may have access to certain user data as necessary to perform their functions:</p>

          <div className="space-y-4 !mt-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-slate-800 mb-1">Stripe — Payment Processing</p>
              <p className="text-sm">We use Stripe to handle all subscription billing and payment processing. When you subscribe, your payment details are submitted directly to Stripe and governed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Stripe's Privacy Policy</a>. PitchNode does not store your full card number or CVV.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-slate-800 mb-1">Google — Authentication</p>
              <p className="text-sm">We use Google OAuth for user authentication. When you sign in with Google, we receive your name and email address from Google. This is governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Google's Privacy Policy</a>.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-slate-800 mb-1">Email Delivery</p>
              <p className="text-sm">We use third-party email providers to send transactional emails (trial notices, subscription confirmations, investor updates). These providers process your email address as needed to deliver messages.</p>
            </div>
          </div>

          <p className="!mt-4">
            We do not sell, rent, or share your personal data with any third party for marketing or advertising purposes. Any data shared with third-party providers is limited to what is strictly necessary for them to perform their services.
          </p>
        </Section>

        <Section id="retention" title="5. Data Retention">
          <p>
            We retain your personal data for as long as your account is active or as necessary to provide the Service. If you cancel your subscription, your account data will remain accessible for a short grace period and will then be scheduled for deletion.
          </p>
          <p>
            We may retain certain data for longer periods where required by law (e.g., billing records for tax compliance) or for legitimate business purposes such as fraud prevention and dispute resolution.
          </p>
          <p>
            Backups may persist for a limited period following deletion requests. Data in backups is typically purged within 90 days.
          </p>
        </Section>

        <Section id="rights" title="6. Your Rights">
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Access</strong> — You can request a copy of the personal data we hold about you.</li>
            <li><strong>Correction</strong> — You can update or correct inaccurate information directly within the platform settings or by contacting us.</li>
            <li><strong>Deletion</strong> — You can request that we delete your account and associated personal data. Some data may be retained as required by law.</li>
            <li><strong>Export</strong> — You can request an export of your data in a commonly used, machine-readable format.</li>
            <li><strong>Objection / Restriction</strong> — You may object to or request restriction of certain processing activities.</li>
          </ul>
          <p>
            To exercise any of these rights, please email us at <a href="mailto:christian@pitchnode.com" className="text-violet-600 hover:underline">christian@pitchnode.com</a>. We will respond to verified requests within 30 days.
          </p>
        </Section>

        <Section id="cookies" title="7. Cookies & Tracking">
          <p>
            PitchNode uses cookies and similar technologies to operate the platform and improve your experience.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Essential cookies</strong> — Required for authentication and to keep you logged in across sessions.</li>
            <li><strong>Functional cookies</strong> — Used to remember your preferences (e.g., theme settings).</li>
            <li><strong>Analytics cookies</strong> — Used to understand how users interact with the platform so we can improve it. This data is aggregated and does not identify you personally.</li>
          </ul>
          <p>
            Most browsers allow you to control cookies through their settings. Disabling essential cookies may affect the functionality of the Service.
          </p>
          <p>
            We do not use third-party advertising cookies or track your activity across other websites.
          </p>
        </Section>

        <Section id="children" title="8. Children's Privacy">
          <p>
            PitchNode is not intended for use by individuals under the age of 13. We do not knowingly collect personal data from children under 13.
          </p>
          <p>
            If we become aware that we have inadvertently collected personal data from a child under 13, we will take steps to delete that information promptly. If you believe a child has provided us with personal information, please contact us at <a href="mailto:christian@pitchnode.com" className="text-violet-600 hover:underline">christian@pitchnode.com</a>.
          </p>
        </Section>

        <Section id="changes" title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we make material changes, we will notify you via email or a prominent notice within the platform at least 14 days before the changes take effect.
          </p>
          <p>
            The updated policy will be posted at this URL with a revised effective date. Your continued use of the Service after changes take effect constitutes your acceptance of the updated Privacy Policy.
          </p>
          <p>
            We encourage you to review this page periodically to stay informed about how we protect your information.
          </p>
        </Section>

        <Section id="contact" title="10. Contact Information">
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:</p>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mt-2 space-y-1.5 text-[14px]">
            <p><strong>PitchNode LLC</strong></p>
            <p>Registered Office: 101 N. 1st Ave., Suite 2325 1094, Phoenix, AZ 85003</p>
            <p>Privacy Contact: <a href="mailto:christian@pitchnode.com" className="text-violet-600 hover:underline">christian@pitchnode.com</a></p>
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-8 mt-8 text-center text-xs text-slate-400 space-y-1">
          <p>© {new Date().getFullYear()} PitchNode LLC. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}