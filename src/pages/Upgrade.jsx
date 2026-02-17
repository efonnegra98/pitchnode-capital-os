import React, { useState } from "react";
import { useCompany } from "@/components/useCompany";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Lock, TrendingUp, Users, FileText, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Upgrade() {
  const { company, isLoading } = useCompany();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Call backend function to create Stripe checkout session
      const response = await base44.functions.invoke("createCheckoutSession", {
        company_id: company.id
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to initiate upgrade. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: TrendingUp, title: "Unlimited Updates", description: "Send unlimited monthly investor updates" },
    { icon: Users, title: "Unlimited Investors", description: "Track unlimited investor relationships" },
    { icon: FileText, title: "Full Archive Access", description: "Access your complete update history" },
    { icon: Settings, title: "Advanced Features", description: "Fundraising tracking & analytics" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  const now = new Date();
  const trialEnd = company?.trial_end_date ? new Date(company.trial_end_date) : null;
  const daysRemaining = trialEnd ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : 0;
  const isTrialActive = company?.subscription_status === "trialing" && daysRemaining > 0;
  const isExpired = company?.subscription_status !== "active" && daysRemaining <= 0;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6D5DF6]/10 text-[#6D5DF6] text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {isExpired ? "Trial Expired" : isTrialActive ? `${daysRemaining} Days Remaining` : "Upgrade to Pro"}
          </div>
          <h1 className="text-4xl font-bold text-[#0F172A] mb-4">
            {isExpired ? "Continue Your Journey" : "Unlock Full Access"}
          </h1>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
            {isExpired 
              ? "Your trial has ended. Upgrade now to continue managing your capital raise."
              : "Get unlimited access to all CapitalOS features and take your fundraising to the next level."
            }
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-2xl mx-auto border-2 border-[#6D5DF6] shadow-lg">
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-2xl font-bold text-[#0F172A]">CapitalOS Pro</CardTitle>
            <CardDescription className="text-[#64748B] mt-2">Everything you need to close your round</CardDescription>
            <div className="mt-6">
              <div className="text-5xl font-bold text-[#0F172A]">$99<span className="text-2xl text-[#64748B] font-normal">/month</span></div>
              <p className="text-sm text-[#64748B] mt-2">Cancel anytime. No long-term commitment.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-[#6D5DF6]/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#6D5DF6]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0F172A]">{feature.title}</div>
                      <div className="text-sm text-[#64748B]">{feature.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <Button 
              onClick={handleUpgrade}
              disabled={loading || company?.subscription_status === "active"}
              className="w-full bg-[#6D5DF6] hover:bg-[#5346E0] text-white h-12 text-base font-semibold"
            >
              {loading ? "Processing..." : company?.subscription_status === "active" ? "Already Subscribed" : "Upgrade Now"}
            </Button>

            {company?.subscription_status !== "active" && (
              <p className="text-xs text-center text-[#64748B]">
                Secure payment powered by Stripe. No credit card required for trial.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Back link for trial users */}
        {isTrialActive && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="text-sm text-[#64748B] hover:text-[#0F172A]"
            >
              Continue with trial →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}