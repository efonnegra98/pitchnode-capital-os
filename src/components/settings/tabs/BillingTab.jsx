import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

const STRIPE_PAYMENT_URL = "https://buy.stripe.com/3cI00jf5Demc8vteLS7Zu00";

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function StatusBadge({ status, trialEndDate }) {
  const isTrialing = status === "trialing" && trialEndDate && new Date(trialEndDate) > new Date();
  if (status === "active") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5" /> Active
    </span>
  );
  if (isTrialing) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
      <Clock className="w-3.5 h-3.5" /> Trial
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <XCircle className="w-3.5 h-3.5" /> {status || "No Plan"}
    </span>
  );
}

function CancelModal({ onConfirm, onClose, isCancelling, endDate }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:px-4" onClick={onClose}>
      <div className="bg-card border border-border sm:rounded-2xl rounded-t-2xl shadow-2xl w-full sm:max-w-md p-6 sm:p-7" onClick={e => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center mb-3"><div className="w-10 h-1 rounded-full bg-border" /></div>
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground text-center mb-2">Cancel Subscription?</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Your access will continue until {endDate || "the end of your billing period"}, then your account will become read-only.
        </p>
        <div className="space-y-3">
          <Button onClick={onClose} className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11">Keep My Subscription</Button>
          <Button variant="ghost" onClick={onConfirm} disabled={isCancelling} className="w-full text-red-500 hover:bg-red-50 h-10 text-sm">
            {isCancelling ? "Cancelling…" : "Yes, Cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ onConfirm, onClose, isDeleting }) {
  const [input, setInput] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:px-4" onClick={onClose}>
      <div className="bg-card border border-red-200 sm:rounded-2xl rounded-t-2xl shadow-2xl w-full sm:max-w-md p-6 sm:p-7" onClick={e => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center mb-3"><div className="w-10 h-1 rounded-full bg-border" /></div>
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground text-center mb-2">Delete Your Account?</h2>
        <p className="text-sm text-muted-foreground text-center mb-5">
          This permanently deletes all your data. <strong className="text-foreground">This cannot be undone.</strong>
        </p>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
          </label>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="DELETE"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-red-400"
          />
        </div>
        <div className="space-y-3">
          <Button variant="outline" onClick={onClose} className="w-full">Cancel</Button>
          <Button
            onClick={onConfirm}
            disabled={input !== "DELETE" || isDeleting}
            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
          >
            {isDeleting ? "Deleting…" : "Permanently Delete My Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BillingTab({ company, companyId, user, profile, toast }) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = company?.subscription_status;
  const trialEndDate = company?.trial_end_date;
  const isActive = status === "active";
  const isTrialing = status === "trialing" && trialEndDate && new Date(trialEndDate) > new Date();
  const isCancelled = status === "cancelled" || status === "expired";
  const hasStripeCustomer = !!company?.stripe_customer_id;
  const endDateFormatted = formatDate(trialEndDate);

  const handleManageBilling = async () => {
    setLoadingPortal(true);
    try {
      const res = await base44.functions.invoke("createPortalSession", { company_id: companyId });
      if (res.data?.url) window.location.href = res.data.url;
      else toast({ title: "Could not open billing portal", variant: "destructive" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    try {
      await base44.entities.Company.update(companyId, { subscription_status: "cancelled" });
      setShowCancel(false);
      toast({ title: "Subscription cancelled", description: `Access continues until ${endDateFormatted || "period end"}.` });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (companyId) await base44.entities.Company.delete(companyId);
      if (profile?.id) await base44.entities.UserProfile.delete(profile.id);
      toast({ title: "Account deleted" });
      setTimeout(() => base44.auth.logout(), 1500);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-7 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-5">Current Plan</h2>

        <div className="flex items-center justify-between gap-4 p-4 bg-muted/40 rounded-xl border border-border mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Capital OS Pro — $49/month</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isTrialing && endDateFormatted ? `Trial ends ${endDateFormatted}`
                  : isActive ? "Billed monthly · Cancel anytime"
                  : isCancelled && endDateFormatted ? `Access until ${endDateFormatted}`
                  : "No active subscription"}
              </p>
            </div>
          </div>
          <StatusBadge status={status} trialEndDate={trialEndDate} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {(isActive || isTrialing) && hasStripeCustomer ? (
            <Button variant="outline" onClick={handleManageBilling} disabled={loadingPortal} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              {loadingPortal ? "Opening…" : "Manage Billing"}
            </Button>
          ) : isCancelled ? (
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Reactivate Subscription</Button>
            </a>
          ) : (
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <CreditCard className="w-4 h-4" /> Subscribe Now
              </Button>
            </a>
          )}
        </div>

        {(isActive || isTrialing) && (
          <div className="mt-6 pt-5 border-t border-border">
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={() => setShowCancel(true)}
            >
              Cancel Subscription
            </Button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border-2 border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 rounded-2xl p-6 lg:p-7">
        <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <p className="text-xs text-muted-foreground mb-5">Irreversible actions that permanently affect your account.</p>
        <div className="border-t border-red-200 dark:border-red-900/40 pt-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Delete My Account</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
              Permanently deletes all investor data, updates, and your company profile. Cannot be undone.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0"
            onClick={() => setShowDelete(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {showCancel && (
        <CancelModal onConfirm={handleCancelConfirm} onClose={() => setShowCancel(false)} isCancelling={isCancelling} endDate={endDateFormatted} />
      )}
      {showDelete && (
        <DeleteModal onConfirm={handleDeleteConfirm} onClose={() => setShowDelete(false)} isDeleting={isDeleting} />
      )}
    </div>
  );
}