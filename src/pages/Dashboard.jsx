import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
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

export default function Dashboard() {
  const { data: updates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ["monthly-updates"],
    queryFn: () => base44.entities.MonthlyUpdate.list("-created_date", 50),
  });

  const { data: investors = [], isLoading: investorsLoading } = useQuery({
    queryKey: ["investors"],
    queryFn: () => base44.entities.Investor.list(),
  });

  const { data: settings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => base44.entities.CompanySettings.list(),
  });

  const companySettings = settings?.[0] || {};

  const isLoading = updatesLoading || investorsLoading;

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

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Command Center</h1>
        <p className="text-slate-500 text-sm mt-1">Capital metrics & investor engagement overview</p>
      </div>

      {/* Raise Overview - Only shown when raise_mode is enabled */}
      {companySettings.raise_mode && (
        <RaiseOverview settings={companySettings} />
      )}

      {/* Action Required */}
      <ActionRequired investors={investors} />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Monthly Revenue"
          value={formatCurrency(latestUpdate?.revenue)}
          icon={DollarSign}
          trend={revTrend?.value}
          trendDirection={revTrend?.direction}
          subtext="vs last month"
        />
        <MetricCard
          label="Revenue Growth"
          value={latestUpdate?.revenue_growth ? `${latestUpdate.revenue_growth}%` : "—"}
          icon={TrendingUp}
          trendDirection={latestUpdate?.revenue_growth > 0 ? 'up' : latestUpdate?.revenue_growth < 0 ? 'down' : null}
        />
        <MetricCard
          label="Burn Rate"
          value={formatCurrency(latestUpdate?.burn_rate)}
          icon={Flame}
          trend={burnTrend?.value}
          trendDirection={burnTrend?.direction === 'up' ? 'down' : burnTrend?.direction === 'down' ? 'up' : null}
          subtext="vs last month"
        />
        <MetricCard
          label="Runway"
          value={latestUpdate?.runway_months ? `${latestUpdate.runway_months} mo` : "—"}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Cash Balance"
          value={formatCurrency(latestUpdate?.cash_balance)}
          icon={Wallet}
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

      {/* Charts & Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KPIChart data={chartData} />
        </div>
        <SnapshotSummary latestUpdate={latestUpdate} investorCount={activeInvestors.length} />
      </div>

      {/* Capital Funnel - Only shown when raise_mode is enabled */}
      {companySettings.raise_mode && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CapitalFunnel investors={investors} />
          <RaiseReadiness />
        </div>
      )}
    </div>
  );
}