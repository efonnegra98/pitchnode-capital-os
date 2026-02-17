import React from "react";
import { useCompany } from "@/components/useCompany";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TrialExpired() {
  const { company } = useCompany();

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[#6D5DF6]/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-[#6D5DF6]" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#0F172A] mb-4">
          Your Trial Has Ended
        </h1>
        
        <p className="text-[#64748B] mb-8">
          Thanks for trying CapitalOS! To continue accessing your investor dashboard and updates, please upgrade to a paid plan.
        </p>

        <Link to={createPageUrl("Upgrade")}>
          <Button className="bg-[#6D5DF6] hover:bg-[#5346E0] w-full h-12">
            <Sparkles className="w-4 h-4 mr-2" />
            View Pricing & Upgrade
          </Button>
        </Link>

        <p className="text-xs text-[#64748B] mt-6">
          Questions? Contact support at hello@pitchnode.com
        </p>
      </div>
    </div>
  );
}