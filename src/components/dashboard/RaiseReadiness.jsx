import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Circle, Clock, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_ITEMS = [
  { item_name: "Pitch Deck Finalized", order: 1 },
  { item_name: "Financial Model Updated", order: 2 },
  { item_name: "Cap Table Clean", order: 3 },
  { item_name: "KPI Dashboard Updated", order: 4 },
  { item_name: "Legal Structure Verified", order: 5 },
  { item_name: "Data Room Organized", order: 6 },
  { item_name: "Customer References Ready", order: 7 },
  { item_name: "Use of Funds Breakdown Prepared", order: 8 },
];

const statusIcons = {
  "Not Started": Circle,
  "In Progress": Clock,
  "Complete": CheckCircle2,
};

const statusColors = {
  "Not Started": "text-slate-400",
  "In Progress": "text-amber-600",
  "Complete": "text-emerald-600",
};

export default function RaiseReadiness() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["raise-readiness"],
    queryFn: async () => {
      const existing = await base44.entities.RaiseReadinessItem.list();
      if (existing.length === 0) {
        // Initialize with default items
        await base44.entities.RaiseReadinessItem.bulkCreate(DEFAULT_ITEMS);
        return await base44.entities.RaiseReadinessItem.list();
      }
      return existing;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RaiseReadinessItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raise-readiness"] });
    },
  });

  const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  const completeCount = items.filter((i) => i.status === "Complete").length;
  const readinessScore = items.length > 0 ? Math.round((completeCount / items.length) * 100) : 0;

  const handleStatusChange = (item, newStatus) => {
    updateMutation.mutate({
      id: item.id,
      data: { status: newStatus },
    });
  };

  const handleNotesChange = (item, notes) => {
    updateMutation.mutate({
      id: item.id,
      data: { notes },
    });
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded mb-4" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Raise Readiness & Data Room Control
          </h2>
          <p className="text-slate-400 text-xs mt-1">Institutional preparedness checklist</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Readiness Score</p>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <span className="text-2xl font-bold text-violet-600">{readinessScore}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sortedItems.map((item) => {
          const StatusIcon = statusIcons[item.status || "Not Started"];
          const isExpanded = expandedId === item.id;

          return (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <button
                  onClick={() =>
                    handleStatusChange(
                      item,
                      item.status === "Not Started"
                        ? "In Progress"
                        : item.status === "In Progress"
                        ? "Complete"
                        : "Not Started"
                    )
                  }
                  className="flex-shrink-0 transition-colors"
                >
                  <StatusIcon className={`w-5 h-5 ${statusColors[item.status || "Not Started"]}`} />
                </button>
                <div className="flex-1">
                  <p className="text-sm text-slate-800 font-medium">{item.item_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-medium ${
                        statusColors[item.status || "Not Started"]
                      }`}
                    >
                      {item.status || "Not Started"}
                    </span>
                    {item.updated_date && (
                      <span className="text-[10px] text-slate-400">
                        Updated {new Date(item.updated_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-slate-200 pt-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">
                      Status
                    </label>
                    <Select
                      value={item.status || "Not Started"}
                      onValueChange={(v) => handleStatusChange(item, v)}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Not Started", "In Progress", "Complete"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">
                      Notes
                    </label>
                    <Textarea
                      value={item.notes || ""}
                      onChange={(e) => handleNotesChange(item, e.target.value)}
                      onBlur={(e) => handleNotesChange(item, e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-800 text-sm min-h-[60px]"
                      placeholder="Add notes..."
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}