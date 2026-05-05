import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useCompany } from "../components/useCompany";
import {
  DollarSign,
  TrendingUp,
  Flame,
  Clock,
  Wallet,
  Users,
  Send
} from "lucide-react";
import MetricCard from "../components/dashboard/MetricCard";
import KPIChart from "../components/dashboard/KPIChart";
import SnapshotSummary from "../components/dashboard/SnapshotSummary";
import RaiseOverview from "../components/dashboard/RaiseOverview";
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
  const { company, companyId, isLoading: companyLoading } = useCompany();
  const { toast } = useToast();

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

  const isLoading = companyLoading || updatesLoading || investorsLoading;

  const sortedUpdates = [...updates].sort((a, b) => {
    return new Date(a.created_date) - new Date(b.created_date);
  });

  const latestUpdate = updates.length > 0 ? updates[0] : null;
  const prevUpdate = updates.length > 1 ? updates[1] : null;

  const formatCurrency = (val) => {
    if (!val && val !== 0) return "—";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  const calcTrend = (current, previous) => {
    if (!current || !previous) return null;
    const diff = ((current - previous) / previous * 100).toFixed(1);
    return { value: `${Math.abs(diff)}%`, direction: diff >= 0 ? 'up' : 'down' };
  };

  const revTrend = calcTrend(latestUpdate?.revenue, prevUpdate?.revenue);
  const burnTrend = calcTrend(latestUpdate?.burn_rate, prevUpdate?.burn_rate);

  const lastSent = updates.find(u => u.status === 'sent');

  const chartData = sortedUpdates
    .filter(u => u.revenue)
    .map(u => ({
      month: u.month?.substring(0, 3) || "",
      revenue: u.revenue,
    }));

  const activeInvestors = investors.filter(i => i.status === 'Engaged' || i.status === 'Committed' || i.status === 'Warm');

  const queryClient = useQueryClient();

  const updateMetricMutation = useMutation({
    mutationFn: ({ field, value }) => {
      if (latestUpdate?.id) {
        return base44.entities.MonthlyUpdate.update(latestUpdate.id, { [field]: value });
      }
      // Create a new update record if none exists yet
      const now = new Date();
      const month = now.toLocaleString("en-US", { month: "long", year: "numeric" });
      return base44.entities.MonthlyUpdate.create({ company_id: companyId, month, [field]: value });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] }),
  });

  const saveMetric = (field) => (value) => updateMetricMutation.mutateAsync({ field, value });

  const raiseSignals = computeRaiseSignals({ company, investors, updates, readinessItems });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-xl" />)}
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
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground dark:text-slate-50 tracking-tight">Command Center</h1>
        <p className="text-secondary-foreground text-sm mt-1">Capital metrics & investor engagement overview</p>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <MetricCard
                  label="Monthly Revenue"
                  value={formatCurrency(latestUpdate?.revenue)}
                  icon={DollarSign}
                  trend={revTrend?.value}
                  trendDirection={revTrend?.direction}
                  subtext="vs last month"
                  onSave={saveMetric("revenue")}
                />
                <MetricCard
                  label="Revenue Growth"
                  value={latestUpdate?.revenue_growth ? `${latestUpdate.revenue_growth}%` : "—"}
                  icon={TrendingUp}
                  trendDirection={latestUpdate?.revenue_growth > 0 ? 'up' : latestUpdate?.revenue_growth < 0 ? 'down' : null}
                  onSave={saveMetric("revenue_growth")}
                />
                <MetricCard
                  label="Burn Rate"
                  value={formatCurrency(latestUpdate?.burn_rate)}
                  icon={Flame}
                  trend={burnTrend?.value}
                  trendDirection={burnTrend?.direction === 'up' ? 'down' : burnTrend?.direction === 'down' ? 'up' : null}
                  subtext="vs last month"
                  onSave={saveMetric("burn_rate")}
                />
                <MetricCard
                  label="Runway"
                  value={latestUpdate?.runway_months ? `${latestUpdate.runway_months} mo` : "—"}
                  icon={Clock}
                  onSave={saveMetric("runway_months")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <MetricCard
                  label="Cash Balance"
                  value={formatCurrency(latestUpdate?.cash_balance)}
                  icon={Wallet}
                  onSave={saveMetric("cash_balance")}
                />
                <MetricCard
                  label="Active Investors"
                  value={activeInvestors.length}
                  icon={Users}
                  subtext={`of ${investors.length} total`}
                />
                <MetricCard
                  label="Last Update Sent"
                  value={lastSent?.sent_date
                    ? new Date(lastSent.sent_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : "—"
                  }
                  icon={Send}
                  subtext={lastSent?.month}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <KPIChart data={chartData} />
                </div>
                <SnapshotSummary latestUpdate={latestUpdate} investorCount={activeInvestors.length} />
              </div>
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
  );
}