import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, TrendingUp, DollarSign, Flame, Clock } from "lucide-react";
import UpdatePreview from "../components/update/UpdatePreview";

export default function UpdateArchive() {
  const [selectedId, setSelectedId] = useState(null);

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["monthly-updates"],
    queryFn: () => base44.entities.MonthlyUpdate.list("-created_date", 100),
  });

  const { data: settings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => base44.entities.CompanySettings.list(),
  });

  const companyName = settings?.[0]?.company_name || "";
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
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Update Archive</h1>
        <p className="text-white/30 text-sm mt-1">Chronological history of all investor updates</p>
      </div>

      {updates.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-white/30 text-sm">No updates archived yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* List */}
          <div className="xl:col-span-2 space-y-2">
            {/* KPI Comparison Header */}
            <div className="glass rounded-xl p-4 mb-4">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-medium mb-3">KPI Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30">
                      <th className="text-left font-medium pb-2">Period</th>
                      <th className="text-right font-medium pb-2">Rev</th>
                      <th className="text-right font-medium pb-2">Burn</th>
                      <th className="text-right font-medium pb-2">Runway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {updates.slice(0, 6).map((u) => (
                      <tr key={u.id} className="text-white/50">
                        <td className="py-1.5 text-white/60 font-medium">{u.month?.substring(0, 3)}</td>
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
                    ? "bg-violet-600/15 border border-violet-500/20"
                    : "glass hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${update.status === 'sent' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <p className="text-white font-medium text-sm">{update.month}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${
                    update.status === 'sent' ? 'text-emerald-400/60' : 'text-amber-400/60'
                  }`}>
                    {update.status}
                  </span>
                </div>
                {update.highlights && (
                  <p className="text-white/25 text-xs mt-2 line-clamp-1 pl-5">{update.highlights}</p>
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
                <p className="text-white/20 text-sm">Select an update to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}