import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  DollarSign, TrendingUp, Flame, Clock, Wallet, Send,
  Download, AlertTriangle, CheckCircle2
} from "lucide-react";
import MetricCard from "./MetricCard";
import MetricSparkline from "./MetricSparkline";
import RunwayAlert, { runwayColor } from "./RunwayAlert";
import InvestorMetricsSummary from "./InvestorMetricsSummary";
import BurnMultipleCard from "./BurnMultipleCard";
import KPIChart from "./KPIChart";
import SnapshotSummary from "./SnapshotSummary";

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(val) {
  if (!val && val !== 0) return "—";
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
  return `$${val.toLocaleString()}`;
}

function calcTrend(current, previous) {
  if (!current || !previous) return null;
  const diff = ((current - previous) / previous * 100).toFixed(1);
  return { value: `${Math.abs(diff)}%`, direction: diff >= 0 ? "up" : "down" };
}

function buildSparkline(updates, field) {
  return [...updates]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .slice(-6)
    .map(u => ({ value: u[field] || null }));
}

function exportCSV(metrics) {
  const rows = [
    ["Metric", "Value"],
    ["MRR", metrics.mrr ?? ""],
    ["ARR", metrics.arr ?? ""],
    ["Burn Rate / Month", metrics.burn ?? ""],
    ["Cash on Hand", metrics.cash ?? ""],
    ["Runway (months)", metrics.runway ?? ""],
    ["MoM Growth %", metrics.growth ?? ""],
    ["Burn Multiple", metrics.bm ?? ""],
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `metrics-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── main component ────────────────────────────────────────────────────────────
export default function FinancialMetricsSection({ updates = [], companyId, investors = [] }) {
  const queryClient = useQueryClient();

  const sortedUpdates = [...updates].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const latestUpdate = sortedUpdates[0] || null;
  const prevUpdate = sortedUpdates[1] || null;

  // Auto-calculated fields
  const mrr = latestUpdate?.revenue || null;
  const arr = mrr ? mrr * 12 : null;
  const burn = latestUpdate?.burn_rate || null;
  const cash = latestUpdate?.cash_balance || null;
  const runwayRaw = latestUpdate?.runway_months || (burn && cash ? Math.floor(cash / burn) : null);
  const growth = latestUpdate?.revenue_growth || null;
  const prevMrr = prevUpdate?.revenue || null;
  const newMRR = mrr && prevMrr ? mrr - prevMrr : null;
  const burnMultiple = burn && newMRR && newMRR > 0 ? burn / (newMRR * 12) : null;

  // Trends
  const revTrend = calcTrend(mrr, prevMrr);
  const burnTrend = calcTrend(burn, prevUpdate?.burn_rate);
  const cashTrend = calcTrend(cash, prevUpdate?.cash_balance);
  const runwayTrend = calcTrend(runwayRaw, prevUpdate?.runway_months);

  // Last updated staleness
  const lastUpdated = latestUpdate?.updated_date || latestUpdate?.created_date;
  const daysSinceUpdate = lastUpdated
    ? Math.floor((Date.now() - new Date(lastUpdated)) / 86400000)
    : null;
  const isStale = daysSinceUpdate !== null && daysSinceUpdate >= 30;

  // Mutation to save metric to latest update
  const updateMetricMutation = useMutation({
    mutationFn: ({ field, value }) => {
      if (latestUpdate?.id) {
        return base44.entities.MonthlyUpdate.update(latestUpdate.id, { [field]: value });
      }
      const now = new Date();
      const month = now.toLocaleString("en-US", { month: "long", year: "numeric" });
      return base44.entities.MonthlyUpdate.create({ company_id: companyId, month, [field]: value });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] }),
  });

  const saveMetric = (field) => (value) => updateMetricMutation.mutateAsync({ field, value });

  const activeInvestors = investors.filter(i => ["Engaged", "Committed", "Warm"].includes(i.status));
  const lastSent = updates.find(u => u.status === "sent");

  const chartData = [...updates]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .filter(u => u.revenue)
    .map(u => ({ month: u.month?.substring(0, 3) || "", revenue: u.revenue }));

  const exportMetrics = () => exportCSV({
    mrr, arr, burn, cash,
    runway: runwayRaw,
    growth,
    bm: burnMultiple !== null ? burnMultiple.toFixed(2) : null,
  });

  return (
    <div>
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {isStale && (
            <div className="flex items-center gap-1.5 mt-1 text-amber-600 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Your metrics are {daysSinceUpdate}+ days old — investors expect current numbers. Update now.
            </div>
          )}
          {lastUpdated && !isStale && (
            <p className="text-[10px] text-slate-400 dark:text-[#888888] mt-1">
              Last updated: {new Date(lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
        <button
          onClick={exportMetrics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-[#888888] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#2a2a2a] transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* ── 6 Core Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {/* MRR */}
        <div className="flex flex-col gap-1">
          <MetricCard
            label="MRR"
            value={fmt(mrr)}
            icon={DollarSign}
            trend={revTrend?.value}
            trendDirection={revTrend?.direction}
            subtext="monthly recurring"
            onSave={saveMetric("revenue")}
          />
          <div className="px-2"><MetricSparkline data={buildSparkline(updates, "revenue")} /></div>
        </div>

        {/* ARR — auto-calculated */}
        <div className="flex flex-col gap-1">
          <div className="glass dark:bg-[#1a1a1a] rounded-xl p-5 metric-glow relative border-slate-200 dark:border-[#2a2a2a]">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 dark:text-[#888888] font-medium">ARR</p>
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{fmt(arr)}</p>
            <p className="text-xs text-slate-400 dark:text-[#888888] mt-2">MRR × 12 (auto)</p>
          </div>
          <div className="px-2"><MetricSparkline data={buildSparkline(updates, "revenue").map(d => ({ value: d.value ? d.value * 12 : null }))} /></div>
        </div>

        {/* Burn Rate */}
        <div className="flex flex-col gap-1">
          <MetricCard
            label="Burn Rate / Mo"
            value={fmt(burn)}
            icon={Flame}
            trend={burnTrend?.value}
            trendDirection={burnTrend?.direction === "up" ? "down" : burnTrend?.direction === "down" ? "up" : null}
            subtext="monthly cash burn"
            onSave={saveMetric("burn_rate")}
          />
          <div className="px-2"><MetricSparkline data={buildSparkline(updates, "burn_rate")} color="#f97316" /></div>
        </div>

        {/* Cash on Hand */}
        <div className="flex flex-col gap-1">
          <MetricCard
            label="Cash on Hand"
            value={fmt(cash)}
            icon={Wallet}
            trend={cashTrend?.value}
            trendDirection={cashTrend?.direction}
            subtext="current balance"
            onSave={saveMetric("cash_balance")}
          />
          <div className="px-2"><MetricSparkline data={buildSparkline(updates, "cash_balance")} color="#10b981" /></div>
        </div>

        {/* Runway — color-coded */}
        <div className="flex flex-col gap-1">
          <div className="glass dark:bg-[#1a1a1a] rounded-xl p-5 metric-glow relative group cursor-pointer hover:ring-1 hover:ring-violet-300 hover:bg-violet-50/20 dark:hover:ring-violet-600 dark:hover:bg-violet-950/20 border-slate-200 dark:border-[#2a2a2a]"
            onClick={() => {}}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 dark:text-[#888888] font-medium">Runway</p>
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            <p className={`text-2xl font-bold tracking-tight dark:text-white ${runwayColor(runwayRaw)}`}>
              {runwayRaw ? `${runwayRaw} mo` : "—"}
            </p>
            <p className="text-xs text-slate-400 dark:text-[#888888] mt-2">
              {burn && cash ? "Auto: cash ÷ burn" : "Set cash & burn to auto-calc"}
            </p>
            <RunwayAlert months={runwayRaw} />
          </div>
          <div className="px-2"><MetricSparkline data={buildSparkline(updates, "runway_months")} color="#8b5cf6" /></div>
        </div>

        {/* MoM Growth */}
        <div className="flex flex-col gap-1">
          <MetricCard
            label="MoM Growth %"
            value={growth != null ? `${growth > 0 ? "+" : ""}${growth}%` : "—"}
            icon={TrendingUp}
            trendDirection={growth > 0 ? "up" : growth < 0 ? "down" : null}
            subtext="revenue growth"
            onSave={saveMetric("revenue_growth")}
          />
          <div className="px-2"><MetricSparkline data={buildSparkline(updates, "revenue_growth")} color="#3b82f6" /></div>
        </div>
      </div>

      {/* ── Burn Multiple ── */}
      <div className="mb-4">
        <BurnMultipleCard burnRate={burn} newMRR={newMRR} />
      </div>

      {/* ── What Investors Will Ask ── */}
      <InvestorMetricsSummary
        mrr={mrr}
        momGrowth={growth}
        burnRate={burn}
        runway={runwayRaw}
        burnMultiple={burnMultiple}
      />

      {/* ── Existing: Revenue Chart + Snapshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2">
          <KPIChart data={chartData} />
        </div>
        <SnapshotSummary latestUpdate={latestUpdate} investorCount={activeInvestors.length} />
      </div>

      {/* ── Last Updated footer ── */}
      {lastUpdated && (
        <p className="text-[10px] text-slate-400 dark:text-[#888888] mt-3 text-right">
          Last updated: {new Date(lastUpdated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      )}
    </div>
  );
}