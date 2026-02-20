import React from "react";
import { ChevronDown, ChevronUp, Send } from "lucide-react";

const statusColors = {
  Warm: "bg-amber-50 text-amber-700 border-amber-200",
  Engaged: "bg-blue-50 text-blue-700 border-blue-200",
  Passed: "bg-slate-100 text-slate-500 border-slate-200",
  Committed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const strengthColors = {
  New: "text-slate-400",
  Building: "text-amber-600",
  Strong: "text-blue-600",
  Champion: "text-emerald-600",
};

const cadenceColors = {
  "On Track": "text-emerald-600",
  "Overdue": "text-red-600",
  "Waiting": "text-amber-600",
  "Closed": "text-slate-400",
};

function getStaleness(dateStr) {
  if (!dateStr) return null;
  const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (days >= 21) return { label: "At Risk", days, level: "critical" };
  if (days >= 14) return { label: "At Risk", days, level: "high" };
  if (days >= 7)  return { label: "Stale",   days, level: "medium" };
  return { label: null, days, level: "ok" };
}

function formatRelative(days) {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function InvestorTable({ investors, sortField, sortDir, onSort, onEdit, onFollowUp }) {
  const SortHeader = ({ field, children }) => (
    <th
      className="text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium py-3 px-4 cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </span>
    </th>
  );

  if (investors.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-muted-foreground text-sm">No investors tracked yet. Add your first investor contact.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="firm">Firm</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="relationship_strength">Strength</SortHeader>
              <SortHeader field="next_action_date">Next Action</SortHeader>
              <SortHeader field="cadence_status">Cadence</SortHeader>
              <SortHeader field="last_contact_date">Last Contact</SortHeader>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {investors.map((inv) => {
              const staleness = getStaleness(inv.last_contact_date);
              const isCritical = staleness?.level === "critical";

              return (
                <tr
                  key={inv.id}
                  onClick={() => onEdit(inv)}
                  className={`cursor-pointer transition-colors ${
                    isCritical
                      ? "bg-red-50/40 hover:bg-red-50/70"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {/* Name */}
                  <td className="py-3 px-4 font-medium text-foreground">{inv.name}</td>

                  {/* Firm */}
                  <td className="py-3 px-4 text-muted-foreground">{inv.firm || "—"}</td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {inv.status ? (
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border ${statusColors[inv.status] || ""}`}>
                        {inv.status}
                      </span>
                    ) : "—"}
                  </td>

                  {/* Relationship Strength */}
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium ${strengthColors[inv.relationship_strength] || "text-slate-400"}`}>
                      {inv.relationship_strength || "—"}
                    </span>
                  </td>

                  {/* Next Action + Last Note */}
                  <td className="py-3 px-4">
                    {inv.next_action_date ? (
                      <div>
                        <p className="text-foreground text-xs">
                          {new Date(inv.next_action_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        {inv.next_action_type && (
                          <p className="text-muted-foreground text-[10px] mt-0.5">{inv.next_action_type}</p>
                        )}
                      </div>
                    ) : (
                      inv.last_note ? null : <span className="text-xs text-muted-foreground">—</span>
                    )}
                    {inv.last_note && (
                      <p className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[160px]" title={inv.last_note}>
                        "{inv.last_note}"
                      </p>
                    )}
                  </td>

                  {/* Cadence */}
                  <td className="py-3 px-4">
                    {inv.cadence_status ? (
                      <span className={`text-xs font-medium ${cadenceColors[inv.cadence_status] || "text-slate-400"}`}>
                        {inv.cadence_status}
                      </span>
                    ) : "—"}
                  </td>

                  {/* Last Contact — enhanced */}
                  <td className="py-3 px-4">
                    {inv.last_contact_date && staleness ? (
                      <div className="flex items-center gap-2">
                        <div>
                          <p className={`text-xs font-medium ${
                            staleness.level === "critical" ? "text-red-600"
                            : staleness.level === "high" ? "text-red-500"
                            : staleness.level === "medium" ? "text-amber-600"
                            : "text-slate-700"
                          }`}>
                            {formatRelative(staleness.days)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatShortDate(inv.last_contact_date)}
                          </p>
                        </div>
                        {staleness.label && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            staleness.level === "critical" || staleness.level === "high"
                              ? "bg-red-100 text-red-600"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {staleness.label}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Follow Up action */}
                  <td className="py-3 px-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFollowUp(inv);
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-[#6D5DF6] border border-slate-200 hover:border-[#6D5DF6]/40 rounded-lg px-2.5 py-1.5 transition-all whitespace-nowrap"
                    >
                      <Send className="w-3 h-3" />
                      Follow Up
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}