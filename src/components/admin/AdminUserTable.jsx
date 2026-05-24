import React from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, UserX } from "lucide-react";

function statusBadge(subscriptionStatus, trialActive, hasProfile) {
  if (!hasProfile) return <Badge className="bg-slate-100 text-slate-500 border-slate-200">No Profile</Badge>;
  if (subscriptionStatus === "active") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Paid Active</Badge>;
  if (trialActive) return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Trial Active</Badge>;
  return <Badge className="bg-red-100 text-red-600 border-red-200">Trial Expired</Badge>;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminUserTable({ users, onView }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left">
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name / Email</th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed Up</th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Investors</th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Updates</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">No users found</td>
            </tr>
          )}
          {users.map((u) => (
            <tr
              key={u.user_id || u.profile_id || u.user_email}
              className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${!u.has_profile ? "opacity-60" : ""}`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {!u.has_profile && <UserX className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                  <div>
                    <p className="font-medium text-slate-800">
                      {u.full_name !== "—" ? u.full_name : u.user_email}
                    </p>
                    <p className="text-xs text-slate-400">{u.user_email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{u.company_name}</td>
              <td className="px-4 py-3">{statusBadge(u.subscription_status, u.trial_active, u.has_profile)}</td>
              <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.signup_date)}</td>
              <td className="px-4 py-3 text-slate-400 text-xs">{formatDateTime(u.last_login_date)}</td>
              <td className="px-4 py-3 text-center text-slate-700 font-medium">{u.investor_count || 0}</td>
              <td className="px-4 py-3 text-center text-slate-700 font-medium">{u.updates_count || 0}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onView(u)}
                  className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors whitespace-nowrap"
                >
                  View <ExternalLink className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}