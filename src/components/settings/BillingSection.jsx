import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, CheckCircle, XCircle, AlertCircle } from "lucide-react";

function StatusBadge({ status }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
        <CheckCircle className="w-3.5 h-3.5" /> Active
      </span>
    );
  }
  if (status === "trialing") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">
        <CheckCircle className="w-3.5 h-3.5" /> Trial
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <XCircle className="w-3.5 h-3.5" /> Expired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
      <AlertCircle className="w-3.5 h-3.5" /> No Plan
    </span>
  );
}

export default function BillingSection({ company, companyId }) {
  const [loadingPortal, setLoadingPortal] = useState(false);

  const [error, setError] = useState(null);

  const status = company?.subscription_status;
  const hasStripeCustomer = !!company?.stripe_customer_id;
  const isActive = status === "active" || status === "trialing";

  const periodEnd = company?.trial_end_date
    ? new Date(company.trial_end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const handleManageBilling = async () => {
    setError(null);
    setLoadingPortal(true);
    try {
      const res = await base44.functions.invoke("createPortalSession", { company_id: companyId });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || "Could not open billing portal.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const STRIPE_PAYMENT_URL = "https://buy.stripe.com/3cI00jf5Demc8vteLS7Zu00";

  const handleSubscribe = () => {
    window.open(STRIPE_PAYMENT_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
      <div className="mb-6">
        <h2 className="text-sm font-bold text-[#6D5DF6] uppercase tracking-wider">Billing & Subscription</h2>
        <p className="text-slate-500 text-xs mt-1">Manage your CapitalOS subscription and payment methods.</p>
        <div className="mt-3 border-t border-slate-200" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-800">CapitalOS Pro</span>
            <StatusBadge status={status} />
          </div>
          {isActive && periodEnd && (
            <p className="text-xs text-slate-400 pl-6">
              {status === "trialing" ? "Trial ends" : "Renews"} {periodEnd}
            </p>
          )}
          {status === "expired" && (
            <p className="text-xs text-red-500 pl-6">Your subscription has ended. Subscribe to restore access.</p>
          )}
          {!status && (
            <p className="text-xs text-slate-400 pl-6">No active subscription.</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isActive && hasStripeCustomer ? (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={loadingPortal}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {loadingPortal ? "Opening..." : "Manage Billing"}
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Subscribe Now
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed">
          To update your payment method, view invoices, or cancel your subscription, click <strong>Manage Billing</strong> to access the Stripe Customer Portal.
        </p>
      </div>
    </section>
  );
}