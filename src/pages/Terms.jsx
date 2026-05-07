import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Section = ({ id, title, children }) => (
  <section id={id} className="mb-10">
    <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">{title}</h2>
    <div className="space-y-3 text-slate-700 leading-relaxed text-[15px]">{children}</div>
  </section>
);

export default function Terms() {
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
          <span className="text-sm font-semibold text-slate-800">Terms of Service</span>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500">
            <strong>Effective Date:</strong> May 1, 2026 &nbsp;·&nbsp;
            <strong>Company:</strong> PitchNode LLC
          </p>
        </div>

        {/* TOC */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Table of Contents</p>
          <ol className="space-y-1.5 text-[14px]">
            {[
              ["acceptance", "Acceptance of Terms"],
              ["service", "Description of Service"],
              ["accounts", "User Accounts"],
              ["billing", "Subscription & Billing"],
              ["trial", "Free Trial"],
              ["cancellation", "Cancellation & Refunds"],
              ["use", "Acceptable Use"],
              ["ip", "Intellectual Property"],
              ["data", "Data & Privacy"],
              ["liability", "Limitation of Liability"],
              ["indemnification", "Indemnification"],
              ["termination", "Termination"],
              ["changes", "Changes to Terms"],
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
        <Section id="acceptance" title="1. Acceptance of Terms">
          <p>
            By accessing or using PitchNode (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you ("User" or "you") and PitchNode LLC ("PitchNode," "we," "us," or "our"), a limited liability company registered in the State of Arizona with offices in Chicago, Illinois.
          </p>
          <p>
            By creating an account or clicking "I Agree," you confirm that you are at least 18 years old and have the legal authority to enter into this agreement.
          </p>
        </Section>

        <Section id="service" title="2. Description of Service">
          <p>
            PitchNode is a fundraising intelligence platform designed to help startup founders manage investor relationships, track capital raise progress, build data rooms, compose investor updates, and monitor fundraising health metrics.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice. We are not liable to you or any third party for any modification, suspension, or discontinuation of the Service.
          </p>
        </Section>

        <Section id="accounts" title="3. User Accounts">
          <p>
            To access the Service, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.
          </p>
          <p>
            You agree to notify us immediately at <a href="mailto:christian@pitchnode.com" className="text-violet-600 hover:underline">christian@pitchnode.com</a> if you suspect unauthorized access to your account.
          </p>
          <p>
            Each account is for a single user or company. You may not share your account with third parties or use your account to provide a competing service.
          </p>
        </Section>

        <Section id="billing" title="4. Subscription & Billing">
          <p>
            PitchNode offers a subscription plan at <strong>$49 per month</strong> (the "Subscription Fee"), billed on a recurring monthly basis. All fees are denominated in U.S. dollars.
          </p>
          <p>
            By subscribing, you authorize us (via our payment processor, Stripe) to charge your designated payment method on a monthly basis until you cancel. You are responsible for keeping your billing information current and accurate.
          </p>
          <p>
            If a payment fails, we may suspend access to your account until payment is successfully collected. We reserve the right to modify our pricing with 30 days' prior notice to active subscribers.
          </p>
          <p>
            All subscription fees are exclusive of applicable taxes. You are solely responsible for any taxes, duties, or levies imposed on the purchase of our Service in your jurisdiction.
          </p>
        </Section>

        <Section id="trial" title="5. Free Trial">
          <p>
            New users may access PitchNode on a <strong>7-day free trial</strong> starting from the date of account creation. No payment information is required to start a trial; however, you may be asked to provide payment details before the trial ends to continue access.
          </p>
          <p>
            At the end of the trial period, your subscription will automatically convert to a paid plan at $49/month unless you cancel before the trial expires. We will notify you before your trial ends.
          </p>
          <p>
            PitchNode reserves the right to modify or discontinue the free trial offer at any time without notice.
          </p>
        </Section>

        <Section id="cancellation" title="6. Cancellation & Refunds">
          <p>
            You may cancel your subscription at any time from your account settings or by contacting us at <a href="mailto:christian@pitchnode.com" className="text-violet-600 hover:underline">christian@pitchnode.com</a>.
          </p>
          <p>
            Upon cancellation, your subscription will remain active through the end of the current billing period. We do not provide prorated refunds for partial months of service.
          </p>
          <p>
            We do not offer refunds for previously charged subscription fees, except where required by applicable law or at our sole discretion in exceptional circumstances. If you believe you have been charged in error, please contact our support team within 30 days of the charge.
          </p>
          <p>
            Trial periods are free of charge. No refund is necessary for cancellation during a trial.
          </p>
        </Section>

        <Section id="use" title="7. Acceptable Use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Violate any applicable local, state, national, or international law or regulation;</li>
            <li>Upload, transmit, or share content that is false, misleading, defamatory, obscene, or infringing on third-party rights;</li>
            <li>Attempt to gain unauthorized access to any part of the Service or its related systems;</li>
            <li>Introduce malicious code, viruses, or any software that disrupts the Service;</li>
            <li>Engage in data scraping, reverse engineering, or any automated data collection without our written consent;</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with a person or entity;</li>
            <li>Resell, sublicense, or otherwise commercialize access to the Service without authorization.</li>
          </ul>
          <p>
            Violation of this section may result in immediate suspension or termination of your account.
          </p>
        </Section>

        <Section id="ip" title="8. Intellectual Property">
          <p>
            All content, features, and functionality of the Service — including but not limited to software, text, graphics, logos, icons, and user interface design — are owned by PitchNode LLC or its licensors and are protected by U.S. and international intellectual property laws.
          </p>
          <p>
            You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes, subject to these Terms.
          </p>
          <p>
            You retain ownership of any data or content you upload to the platform ("User Content"). By submitting User Content, you grant PitchNode a limited license to store and process that content solely to provide the Service.
          </p>
          <p>
            You may not copy, modify, distribute, sell, or create derivative works from any part of the Service without our express written permission.
          </p>
        </Section>

        <Section id="data" title="9. Data & Privacy">
          <p>
            Your use of the Service is subject to our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection, use, and storage of your data as described in our Privacy Policy.
          </p>
          <p>
            We implement commercially reasonable technical and organizational security measures to protect your data. However, no method of transmission over the internet or method of electronic storage is 100% secure. We cannot guarantee absolute data security.
          </p>
          <p>
            You are responsible for the accuracy, legality, and appropriateness of all data you upload to the platform, including information about third-party investors. You represent that you have all necessary rights and consents to submit such data.
          </p>
          <p>
            We will not sell your personal data to third parties. We may share data with trusted service providers (e.g., Stripe for billing) solely as needed to operate the Service.
          </p>
        </Section>

        <Section id="liability" title="10. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, PitchNode LLC and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or goodwill — arising from your use of or inability to use the Service.
          </p>
          <p>
            Our total aggregate liability to you for any claims arising from these Terms or your use of the Service shall not exceed the total amount you paid PitchNode in the three (3) months immediately preceding the event giving rise to the claim.
          </p>
          <p>
            Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such jurisdictions, our liability is limited to the greatest extent permitted by law.
          </p>
          <p>
            The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </Section>

        <Section id="indemnification" title="11. Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless PitchNode LLC, its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your use of the Service in violation of these Terms;</li>
            <li>Your User Content or any data you submit to the platform;</li>
            <li>Your violation of any applicable law or third-party rights.</li>
          </ul>
        </Section>

        <Section id="termination" title="12. Termination">
          <p>
            We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, with or without notice, if we believe you have violated these Terms or engaged in conduct harmful to PitchNode, other users, or third parties.
          </p>
          <p>
            You may terminate your account at any time by canceling your subscription and ceasing use of the Service.
          </p>
          <p>
            Upon termination, your right to access the Service will immediately cease. Provisions of these Terms that by their nature should survive termination — including intellectual property, limitation of liability, and indemnification — will survive.
          </p>
          <p>
            We may retain your data for a reasonable period following termination as required by law or for legitimate business purposes, after which it will be deleted in accordance with our data retention policy.
          </p>
        </Section>

        <Section id="changes" title="13. Changes to Terms">
          <p>
            We reserve the right to update or modify these Terms at any time. When we make material changes, we will notify you via email or a prominent notice within the Service at least 14 days before the changes take effect.
          </p>
          <p>
            Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must cancel your subscription and stop using the Service before the changes take effect.
          </p>
        </Section>

        <Section id="contact" title="14. Contact Information">
          <p>If you have any questions about these Terms, please contact us:</p>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mt-2 space-y-1.5 text-[14px]">
            <p><strong>PitchNode LLC</strong></p>
            <p>Registered Office: 101 N. 1st Ave., Suite 2325 1094, Phoenix, AZ 85003</p>
            <p>Operations: Chicago, Illinois</p>
            <p>Support Email: <a href="mailto:christian@pitchnode.com" className="text-violet-600 hover:underline">christian@pitchnode.com</a></p>
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-8 mt-8 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} PitchNode LLC. All rights reserved.</p>
          <p className="mt-1">These Terms are governed by the laws of the State of Illinois.</p>
        </div>
      </div>
    </div>
  );
}