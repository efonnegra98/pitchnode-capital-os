import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Users, Send, DollarSign, ShieldCheck } from "lucide-react";
import ActionRequired from "../dashboard/ActionRequired";
import AdminSupportNotes from "./AdminSupportNotes";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(val) {
  if (!val && val !== 0) return "—";
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
  return `$${val.toLocaleString()}`;
}

export default function AdminUserDetail({ userData, adminUser, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [overrideToggling, setOverrideToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [res, profiles] = await Promise.all([
        base44.functions.invoke("adminGetUserDetail", { company_id: userData.company_id }),
        base44.entities.UserProfile.filter({ user_email: userData.user_email }),
      ]);
      setDetail(res.data);
      setProfile(profiles[0] || null);
      setLoading(false);
    };
    load();
  }, [userData.company_id, userData.user_email]);

  const handleToggleOverride = async () => {
    if (!profile) return;
    setOverrideToggling(true);
    const newVal = !profile.subscription_override;
    await base44.entities.UserProfile.update(profile.id, { subscription_override: newVal });
    setProfile(p => ({ ...p, subscription_override: newVal }));
    setOverrideToggling(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded" />
        <div className="h-48 bg-slate-200 rounded-xl" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const investors = detail?.investors || [];
  const updates = detail?.updates || [];
  const company = detail?.company || {};
  const sentUpdates = updates.filter(u => u.status === "sent").sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date));

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{userData.founder_name !== "—" ? userData.founder_name : userData.user_email}</h2>
            <p className="text-sm text-slate-400">{userData.user_email}</p>
            <p className="text-sm text-slate-600 mt-1">{userData.company_name}</p>
          </div>
          <div className="text-right text-xs text-slate-400 space-y-1">
            <p>Joined: {formatDate(userData.created_date)}</p>
            <p>Trial ends: {formatDate(userData.trial_end_date)}</p>
            <p className="capitalize">Status: <span className="font-medium text-slate-600">{userData.subscription_status}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{investors.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Investors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{updates.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Updates</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{sentUpdates.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Sent</p>
          </div>
        </div>
      </div>

      {/* Subscription Override */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Subscription Override</p>
              <p className="text-xs text-slate-400 mt-0.5">Bypass all Stripe/trial checks for this user</p>
            </div>
          </div>
          <button
            onClick={handleToggleOverride}
            disabled={overrideToggling || !profile}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
              profile?.subscription_override ? "bg-violet-600" : "bg-slate-200"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              profile?.subscription_override ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>
        {profile?.subscription_override && (
          <p className="mt-2 text-xs text-violet-600 font-medium bg-violet-50 rounded-lg px-3 py-1.5">
            ✓ This user has full platform access — no subscription required
          </p>
        )}
      </div>

      {/* Round Overview */}
      {company.raise_mode && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" /> Round Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: "Target", value: formatCurrency(company.target_raise_amount) },
              { label: "Committed", value: formatCurrency(company.capital_committed) },
              { label: "Soft", value: formatCurrency(company.soft_commitments) },
              { label: "Round", value: company.round_type || "—" },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                <p className="text-base font-bold text-slate-800">{item.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Required (read-only) */}
      {investors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" /> Action Required
          </h3>
          <ActionRequired investors={investors} />
        </div>
      )}

      {/* Investor Table (read-only) */}
      {investors.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Investors ({investors.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-2 text-left text-xs text-slate-400 font-medium">Name</th>
                  <th className="px-4 py-2 text-left text-xs text-slate-400 font-medium">Firm</th>
                  <th className="px-4 py-2 text-left text-xs text-slate-400 font-medium">Status</th>
                  <th className="px-4 py-2 text-left text-xs text-slate-400 font-medium">Stage</th>
                  <th className="px-4 py-2 text-left text-xs text-slate-400 font-medium">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {investors.map(inv => (
                  <tr key={inv.id} className="border-b border-slate-50">
                    <td className="px-4 py-2.5 text-slate-700 font-medium">{inv.name || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500">{inv.firm || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500">{inv.status || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500">{inv.funnel_stage || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs">{formatDate(inv.last_contact_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Updates (read-only) */}
      {updates.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-slate-400" /> Recent Updates
          </h3>
          <div className="space-y-2">
            {updates.slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm text-slate-700 font-medium">{u.month}</p>
                  {u.highlights && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{u.highlights}</p>}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  u.status === "sent" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>{u.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Notes */}
      <AdminSupportNotes
        targetUserEmail={userData.user_email}
        companyId={userData.company_id}
        adminEmail={adminUser?.email}
      />
    </div>
  );
}