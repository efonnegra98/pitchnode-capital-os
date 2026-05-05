import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Send, Calendar, FileText } from "lucide-react";
import ArchiveDetailPanel from "../components/update/ArchiveDetailPanel";
import { useCompany } from "../components/useCompany";

const TIME_FILTERS = [
  { label: "All Time", months: null },
  { label: "Last 3 Months", months: 3 },
  { label: "Last 6 Months", months: 6 },
  { label: "Last 12 Months", months: 12 },
  { label: "Archived", months: null, archived: true },
];

export default function UpdateArchive() {
  const [selectedId, setSelectedId] = useState(null);
  const [timeFilter, setTimeFilter] = useState("All Time");
  const { company, companyId } = useCompany();

  const { data: allUpdates = [], isLoading } = useQuery({
    queryKey: ["monthly-updates", companyId],
    queryFn: () => base44.entities.MonthlyUpdate.filter({ company_id: companyId }, "-created_date", 100),
    enabled: !!companyId,
  });

  // Only show sent updates in main view; archived in their own tab
  const sentUpdates = useMemo(() => allUpdates.filter((u) => u.status === "sent"), [allUpdates]);
  const archivedUpdates = useMemo(() => allUpdates.filter((u) => u.status === "archived"), [allUpdates]);

  const isArchiveTab = timeFilter === "Archived";

  // Apply time filter
  const filteredUpdates = useMemo(() => {
    if (isArchiveTab) return archivedUpdates;
    const filter = TIME_FILTERS.find((f) => f.label === timeFilter);
    if (!filter?.months) return sentUpdates;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - filter.months);
    return sentUpdates.filter((u) => {
      const date = new Date(u.sent_date || u.created_date);
      return date >= cutoff;
    });
  }, [sentUpdates, archivedUpdates, timeFilter, isArchiveTab]);

  const selectedUpdate = filteredUpdates.find((u) => u.id === selectedId);
  const companyName = company?.name || "";

  const formatCurrency = (val) => {
    if (!val && val !== 0) return "—";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Archive</h1>
          <p className="text-slate-500 text-sm mt-1">Your complete investor communication history</p>
        </div>
        <Link
          to={createPageUrl("UpdateBuilder")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Update
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-4 h-4 text-slate-400" />
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setTimeFilter(f.label)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeFilter === f.label
                  ? f.archived
                    ? "bg-white text-amber-600 shadow-sm border border-amber-200"
                    : "bg-white text-violet-700 shadow-sm border border-slate-200"
                  : f.archived
                    ? "text-amber-500 hover:text-amber-600"
                    : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 ml-2">
          {filteredUpdates.length} update{filteredUpdates.length !== 1 ? "s" : ""}
        </span>
      </div>

      {sentUpdates.length === 0 && !isArchiveTab ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Send className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">No sent updates yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Updates appear here once they've been sent to investors. Drafts are only visible in Investor Updates.
          </p>
          <Link
            to={createPageUrl("UpdateBuilder")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Update
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── KPI Comparison Table — Hero Element ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-600" />
              <h3 className="text-sm font-semibold text-slate-700">
                {isArchiveTab ? "Archived Drafts" : "KPI Comparison — All Sent Updates"}
              </h3>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {filteredUpdates.length} Periods
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3 uppercase tracking-wider">Period</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wider">Revenue</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wider">Growth</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wider">Burn Rate</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wider">Cash</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wider">Runway</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wider">Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUpdates.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedId(selectedId === u.id ? null : u.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedId === u.id ? "bg-violet-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{u.month}</td>
                      <td className="px-4 py-3.5 text-right text-slate-700">{formatCurrency(u.revenue)}</td>
                      <td className="px-4 py-3.5 text-right">
                        {u.revenue_growth ? (
                          <span className={`font-medium ${u.revenue_growth > 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {u.revenue_growth > 0 ? "+" : ""}{u.revenue_growth}%
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-700">{formatCurrency(u.burn_rate)}</td>
                      <td className="px-4 py-3.5 text-right text-slate-700">{formatCurrency(u.cash_balance)}</td>
                      <td className="px-4 py-3.5 text-right text-slate-700">{u.runway_months ? `${u.runway_months} mo` : "—"}</td>
                      <td className="px-4 py-3.5 text-right text-xs text-slate-400">
                        {u.status === "archived"
                          ? <span className="text-amber-500 font-medium">Archived</span>
                          : u.sent_date ? new Date(u.sent_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUpdates.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                {isArchiveTab ? "No archived updates yet. Archive drafts from the Update Builder." : "No updates match the selected time range."}
              </div>
            )}
          </div>

          {/* ── Detail Panel ── */}
          {selectedUpdate && (
            <ArchiveDetailPanel
              data={selectedUpdate}
              companyName={companyName}
              companyLogo={company?.logo_url}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}