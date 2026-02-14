import React from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Clock, Mail } from "lucide-react";

export default function AccessPending() {
  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">PitchNode Capital OS</h1>
        </div>

        {/* Pending Icon */}
        <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-violet-600" />
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Pending</h2>
        <p className="text-slate-600 text-lg leading-relaxed mb-8">
          Capital OS is invite-only and access is granted exclusively through PitchNode client engagements. 
          Your account has been created but is pending approval.
        </p>

        {/* Contact Info */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-slate-900">Need Help?</h3>
          </div>
          <p className="text-sm text-slate-600">
            If you believe you should have access, please contact your PitchNode representative or reach out to our team.
          </p>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="h-10 px-6"
        >
          Sign Out
        </Button>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">
            Institutional Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}