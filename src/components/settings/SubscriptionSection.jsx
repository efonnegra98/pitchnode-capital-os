import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react";

const STRIPE_PAYMENT_URL = "https://buy.stripe.com/3cI00jf5Demc8vteLS7Zu00";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function StatusBadge({ status, trialEndDate }) {
  const now = new Date();
  const trialEnd = trialEndDate ? new Date(trialEndDate) : null;
  const isTrialing = status === "trialing" && trialEnd && trialEnd > now;
  const isCancelled = status === "cancelled" || status === "expired";
  const isActive = status === "active";

  if (isActive) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5" /> Active
    </span>
  );
  if (isTrialing) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
      <Clock className="w-3.5 h-3.5" /> Free Trial
    </span>
  );
  if (isCancelled) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <XCircle className="w-3.5 h-3.5" /> Cancelled
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5" /> {status}
    </span>
  );
}

// ── Cancel Confirmation Modal ──────────────────────────────────────────────
function CancelModal({ onConfirm, onClose, trialEndDate, isCancelling }) {
  const endDate = formatDate(trialEndDate) || "your billing period end";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-7">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200 mx-auto mb-4">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground text-center mb-2">Are you sure you want to cancel?</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
          Your access will continue until the end of your current billing period. After that, your account will be downgraded to read-only.
        </p>
        <div className="space-y-3">
          <Button
            onClick={onClose}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11 font-semibold"
          >
            Keep My Subscription
          </Button>
          <Button
            variant="ghost"
            onClick={onConfirm}
            disabled={isCancelling}
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 h-10 text-sm"
          >
            {isCancelling ? "Cancelling..." : "Yes, Cancel My Subscription"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Account Modal ───────────────────────────────────────────────────
function DeleteModal({ onConfirm, onClose, isDeleting }) {
  const [input, setInput] = useState("");
  const confirmed = input === "DELETE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card border border-red-200 rounded-2xl shadow-2xl w-full max-w-md p-7">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground text-center mb-2">Delete Your Account?</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-5">
          This will permanently delete your account, all investor data, updates, and data room files. <strong className="text-foreground">This cannot be undone.</strong>
        </p>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="DELETE"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-red-400"
          />
        </div>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full h-10"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!confirmed || isDeleting}
            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-40"
          >
            {isDeleting ? "Deleting..." : "Permanently Delete My Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function SubscriptionSection({ company, companyId, user, profile }) {
  const { toast } = useToast();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = company?.subscription_status;
  const trialEndDate = company?.trial_end_date;
  const isCancelled = status === "cancelled" || status === "expired";
  const isTrialing = status === "trialing" && trialEndDate && new Date(trialEndDate) > new Date();
  const endDateFormatted = formatDate(trialEndDate);

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    try {
      await base44.entities.Company.update(companyId, { subscription_status: "cancelled" });

      // Send cancellation email
      if (user?.email) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "Your PitchNode subscription has been cancelled",
          body: `Hi ${user.full_name || "there"},\n\nYour PitchNode subscription has been cancelled. Your access will continue until ${endDateFormatted || "the end of your current billing period"}.\n\nAfter that date, your account will be downgraded to read-only mode.\n\nIf you change your mind, you can reactivate at any time from your Settings page.\n\nThank you for using PitchNode.\n\n— The PitchNode Team`,
        });
      }

      setShowCancelModal(false);
      toast({
        title: "Subscription cancelled",
        description: `You will have access until ${endDateFormatted || "your billing period ends"}.`,
      });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // Delete all company data
      if (companyId) await base44.entities.Company.delete(companyId);
      if (profile?.id) await base44.entities.UserProfile.delete(profile.id);
      toast({ title: "Account deleted", description: "Your account has been permanently deleted." });
      setTimeout(() => base44.auth.logout(), 1500);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Subscription & Billing */}
      <div className="pt-6 border-t border-border" />

      <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-[#6D5DF6] uppercase tracking-wider">Subscription & Billing</h2>
          <p className="text-muted-foreground text-xs mt-1">Manage your plan and billing preferences.</p>
          <div className="mt-3 border-t border-border" />
        </div>

        {/* Plan info row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-xl border border-border mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">PitchNode — $49/month</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isTrialing && endDateFormatted
                  ? `Trial ends ${endDateFormatted}`
                  : isCancelled && endDateFormatted
                  ? `Access until ${endDateFormatted}`
                  : "Billed monthly · Cancel anytime"}
              </p>
            </div>
          </div>
          <StatusBadge status={status} trialEndDate={trialEndDate} />
        </div>

        {/* Action buttons */}
        {isCancelled ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your subscription is cancelled. Reactivate to continue full access after {endDateFormatted || "your billing period"}.
            </p>
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Reactivate Subscription
              </Button>
            </a>
          </div>
        ) : (
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Subscription
          </Button>
        )}
      </section>

      {/* Danger Zone */}
      <section className="border-2 border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 rounded-2xl p-7">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </h2>
          <p className="text-muted-foreground text-xs mt-1">Irreversible actions that permanently affect your account.</p>
          <div className="mt-3 border-t border-red-200 dark:border-red-900/40" />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Delete My Account</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
              Permanently deletes your account, all investor data, updates, data room files, and company profile. This cannot be undone.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 flex-shrink-0"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </Button>
        </div>
      </section>

      {/* Modals */}
      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancelModal(false)}
          trialEndDate={trialEndDate}
          isCancelling={isCancelling}
        />
      )}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onClose={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}