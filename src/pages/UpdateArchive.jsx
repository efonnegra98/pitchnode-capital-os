import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import UpdatePreview from "../components/update/UpdatePreview";
import { useCompany } from "../components/useCompany";

export default function UpdateArchive() {
  const [selectedId, setSelectedId] = useState(null);
  const { company, companyId } = useCompany();

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["monthly-updates", companyId],
    queryFn: () => base44.entities.MonthlyUpdate.filter({ company_id: companyId }, "-created_date", 100),
    enabled: !!companyId,
  });

  const companyName = company?.name || "";
  const selectedUpdate = updates.find((u) => u.id === selectedId);

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
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Archive</h1>
          <p className="text-muted-foreground text-sm mt-1">Permanent record of investor communications and reporting.</p>
        </div>
        <Link
          to={createPageUrl("UpdateBuilder")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Update
        </Link>
      </div>

      {updates.length === 0 ? (
        <div className="glass rounded-xl p-16 text-center border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">No updates yet.</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first investor update to begin building your reporting history.
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
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* List */}
          <div className="xl:col-span-2 space-y-2">
            {/* KPI Comparison Header */}
            <div className="glass rounded-xl p-4 mb-4">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3">KPI Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left font-medium pb-2">Period</th>
                      <th className="text-right font-medium pb-2">Rev</th>
                      <th className="text-right font-medium pb-2">Burn</th>
                      <th className="text-right font-medium pb-2">Runway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {updates.slice(0, 6).map((u) => (
                      <tr key={u.id} className="text-muted-foreground">
                        <td className="py-1.5 text-foreground font-medium">{u.month?.substring(0, 3)}</td>
                        <td className="py-1.5 text-right">{formatCurrency(u.revenue)}</td>
                        <td className="py-1.5 text-right">{formatCurrency(u.burn_rate)}</td>
                        <td className="py-1.5 text-right">{u.runway_months ? `${u.runway_months}mo` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline */}
            {updates.map((update) => (
              <button
                key={update.id}
                onClick={() => setSelectedId(update.id)}
                className={`w-full text-left rounded-xl p-4 transition-all ${
                  selectedId === update.id
                    ? "bg-violet-50 border border-violet-200"
                    : "glass hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${update.status === 'sent' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <p className="text-foreground font-medium text-sm">{update.month}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${
                    update.status === 'sent' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {update.status}
                  </span>
                </div>
                {update.highlights && (
                  <p className="text-muted-foreground text-xs mt-2 line-clamp-1 pl-5">{update.highlights}</p>
                )}
              </button>
            ))}
          </div>

          {/* Detail View */}
          <div className="xl:col-span-3">
            {selectedUpdate ? (
              <UpdatePreview data={selectedUpdate} companyName={companyName} />
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <p className="text-muted-foreground text-sm">Select an update to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}