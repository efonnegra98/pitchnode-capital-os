import React, { useEffect, useState, useRef, useCallback } from "react";

import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePullToRefresh } from "../lib/usePullToRefresh";
import PullToRefreshIndicator from "../components/ui/PullToRefreshIndicator";
import { useCompany } from "../components/useCompany";
import OnboardingWelcomeFlow from "../components/onboarding/OnboardingWelcomeFlow";
import OnboardingProgressBanner from "../components/onboarding/OnboardingProgressBanner";
import { DollarSign, TrendingUp, Users, Send } from "lucide-react";
import MetricCard from "../components/dashboard/MetricCard";
import KPIChart from "../components/dashboard/KPIChart";
import SnapshotSummary from "../components/dashboard/SnapshotSummary";
import RaiseOverview from "../components/dashboard/RaiseOverview";
import FinancialMetricsSection from "../components/dashboard/FinancialMetricsSection";
import ActionRequired from "../components/dashboard/ActionRequired";
import CapitalFunnel from "../components/dashboard/CapitalFunnel";
import RaiseReadiness from "../components/dashboard/RaiseReadiness";
import RaiseMomentum from "../components/dashboard/RaiseMomentum";

import EmptyState from "../components/dashboard/EmptyState";
import CollapsibleSection from "../components/dashboard/CollapsibleSection";
import RaiseSignals from "../components/dashboard/RaiseSignals";
import RaiseHealthScore from "../components/dashboard/RaiseHealthScore";
import ModuleSignals from "../components/dashboard/ModuleSignals";
import { computeRaiseSignals, getModuleSignals } from "../lib/raiseSignals";
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const { user, profile, company, companyId, isLoading: companyLoading } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const scrollRef = useRef(null);

  // Determine if we should show the welcome flow
  useEffect(() => {
    if (!profile) return;
    // Show if onboarding_shown is false (never seen it) and onboarding not already completed
    if (!profile.onboarding_shown && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile?.id]);

  const dismissBannerMutation = useMutation({
    mutationFn: () => base44.entities.UserProfile.update(profile.id, { onboarding_banner_dismissed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userProfile", user?.email] }),
  });

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    queryClient.invalidateQueries({ queryKey: ["userProfile", user?.email] });
    queryClient.invalidateQueries({ queryKey: ["company", profile?.company_id] });
    queryClient.invalidateQueries({ queryKey: ["investors", companyId] });
  };

  // Show success toast after Stripe checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast({
        title: "Subscription activated!",
        description: "Welcome to CapitalOS Pro. Your account is now fully active.",
      });
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const { data: updates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ["monthly-updates", companyId],
    queryFn: () => base44.entities.MonthlyUpdate.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const { data: investors = [], isLoading: investorsLoading } = useQuery({
    queryKey: ["investors", companyId],
    queryFn: () => base44.entities.Investor.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const { data: readinessItems = [] } = useQuery({
    queryKey: ["raise-readiness", companyId],
    queryFn: () => base44.entities.RaiseReadinessItem.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["investor-activities-dashboard", companyId],
    queryFn: async () => {
      if (!investors.length) return [];
      const ids = investors.map(i => i.id);
      const acts = await base44.entities.InvestorActivity.list("-date", 200);
      return acts.filter(a => ids.includes(a.investor_id));
    },
    enabled: !!companyId && investors.length > 0,
  });

  const isLoading = companyLoading || updatesLoading || investorsLoading;

  const raiseSignals = computeRaiseSignals({ company, investors, updates, readinessItems });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
    await queryClient.invalidateQueries({ queryKey: ["investors", companyId] });
    await queryClient.invalidateQueries({ queryKey: ["raise-readiness", companyId] });
  }, [queryClient, companyId]);

  const { pulling, pullDistance, refreshing } = usePullToRefresh(scrollRef, handleRefresh);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  // Check if there's any data
  const hasUpdates = updates.length > 0;
  const hasInvestors = investors.length > 0;
  const hasAnyData = hasUpdates || hasInvestors;

  return (
    <>
      {/* Onboarding welcome flow modal */}
      {showOnboarding && (
        <OnboardingWelcomeFlow
          profile={profile}
          user={user}
          companyId={companyId}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Onboarding progress banner */}
      {!showOnboarding && profile && (
        <OnboardingProgressBanner
          profile={profile}
          onDismiss={() => dismissBannerMutation.mutate()}
        />
      )}

    <div ref={scrollRef}>
      <PullToRefreshIndicator pulling={pulling} pullDistance={pullDistance} refreshing={refreshing} />
    <div className="p-4 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8 no-select">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">Command Center</h1>
        <p className="text-muted-foreground text-xs lg:text-sm mt-1">Capital metrics & investor engagement overview</p>
      </div>

      {/* Empty State - Show when no data exists */}
      {!hasAnyData ? (
        <div className="space-y-6">
          <EmptyState
            icon={Send}
            title="Welcome to Your Capital OS"
            description="Start by creating your first investor update or adding investors to track your fundraising pipeline."
            actionLabel="Create First Update"
            actionPage="UpdateBuilder"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmptyState
              icon={Users}
              title="Track Investors"
              description="Build your investor pipeline and manage relationships."
              actionLabel="Add Investors"
              actionPage="Investors"
            />
            {company?.raise_mode && (
              <EmptyState
                icon={TrendingUp}
                title="Raise Readiness"
                description="Prepare your data room and track fundraising progress."
                actionLabel="View Checklist"
                actionPage="Dashboard"
                actionScroll="raise-readiness"
              />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* 0. Raise Health Score — hero card */}
          <RaiseHealthScore
            company={company}
            investors={investors}
            updates={updates}
            readinessItems={readinessItems}
            activities={activities}
          />

          {/* 0b. Raise Signals */}
          <div className="mb-6">
            <RaiseSignals signals={raiseSignals} />
          </div>

          {/* 1. Action Required + Momentum — always first */}
          {hasInvestors && (
            <CollapsibleSection title="Action Required" defaultOpen={true} id="action-required">
              <div className="space-y-3">
                <RaiseMomentum investors={investors} />
                <ActionRequired investors={investors} />
              </div>
            </CollapsibleSection>
          )}

          {/* 2. Raise Overview — prominent when raise mode on */}
          {company?.raise_mode && (
            <CollapsibleSection title="Round Overview" defaultOpen={true} id="round-overview">
              <ModuleSignals signals={getModuleSignals(raiseSignals, "Round Overview")} />
              <RaiseOverview settings={company} investors={investors} />
            </CollapsibleSection>
          )}

          {/* 3. Financial Metrics — collapsible */}
          {hasUpdates ? (
            <CollapsibleSection title="Financial Metrics" defaultOpen={false} id="financial-metrics">
              <ModuleSignals signals={getModuleSignals(raiseSignals, "Financial Metrics")} />
              <FinancialMetricsSection
                updates={updates}
                companyId={companyId}
                investors={investors}
              />
            </CollapsibleSection>
          ) : (
            <div className="mb-6">
              <EmptyState
                icon={DollarSign}
                title="No Financial Data Yet"
                description="Create your first investor update to start tracking revenue, burn rate, and runway."
                actionLabel="Create Update"
                actionPage="UpdateBuilder"
              />
            </div>
          )}

          {/* 4. Raise Readiness — collapsed by default */}
          {company?.raise_mode && !hasInvestors && (
            <CollapsibleSection title="Raise Readiness & Data Room" defaultOpen={false} id="raise-readiness">
              <ModuleSignals signals={[...getModuleSignals(raiseSignals, "Raise Readiness"), ...getModuleSignals(raiseSignals, "Data Room")]} />
              <RaiseReadiness />
            </CollapsibleSection>
          )}

          {/* 5. Secondary analytics — collapsed by default */}
          {company?.raise_mode && hasInvestors && (
            <>
              <CollapsibleSection title="Funnel Analytics" defaultOpen={false} id="funnel-analytics">
                <ModuleSignals signals={getModuleSignals(raiseSignals, "Funnel Analytics")} />
                <CapitalFunnel
                  investors={investors}
                  onFollowUp={(inv) => { /* open follow-up modal via ref would require lifting state — just navigate */ window.location.href = "/Investors"; }}
                />
              </CollapsibleSection>
              <CollapsibleSection title="Raise Readiness & Data Room" defaultOpen={false} id="raise-readiness">
                <ModuleSignals signals={[...getModuleSignals(raiseSignals, "Raise Readiness"), ...getModuleSignals(raiseSignals, "Data Room")]} />
                <RaiseReadiness />
              </CollapsibleSection>
            </>
          )}

          {company?.raise_mode && !hasInvestors && (
            <div className="mb-6">
              <EmptyState
                icon={Users}
                title="No Investors Added"
                description="Add investors to track your fundraising pipeline and manage relationships."
                actionLabel="Add Investors"
                actionPage="Investors"
              />
            </div>
          )}

        </>
      )}
    </div>
    </div>
    </>
  );
}