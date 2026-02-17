import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TrialBanner({ company }) {
  if (!company || company.subscription_status === "active") {
    return null;
  }

  const now = new Date();
  const trialEnd = new Date(company.trial_end_date);
  const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));

  if (company.subscription_status === "trialing" && daysRemaining > 0) {
    return (
      <div className="bg-gradient-to-r from-[#6D5DF6]/5 to-[#8B7FF6]/5 border-b border-[#6D5DF6]/10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#6D5DF6]" />
              <span className="text-slate-700">
                <span className="font-semibold text-[#6D5DF6]">{daysRemaining} days</span> remaining in your free trial
              </span>
            </div>
            <Link to={createPageUrl("Upgrade")}>
              <Button size="sm" className="bg-[#6D5DF6] hover:bg-[#5346E0]">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}