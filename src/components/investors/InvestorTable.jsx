import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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

export default function InvestorTable({ investors, sortField, sortDir, onSort, onEdit }) {
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {investors.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => onEdit(inv)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-medium text-foreground">{inv.name}</td>
                <td className="py-3 px-4 text-muted-foreground">{inv.firm || "—"}</td>
                <td className="py-3 px-4">
                  {inv.status ? (
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border ${statusColors[inv.status] || ''}`}>
                      {inv.status}
                    </span>
                  ) : "—"}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium ${strengthColors[inv.relationship_strength] || 'text-white/30'}`}>
                    {inv.relationship_strength || "—"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {inv.next_action_date ? (
                    <div>
                      <p className="text-foreground text-xs">
                        {new Date(inv.next_action_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {inv.next_action_type && (
                        <p className="text-muted-foreground text-[10px] mt-0.5">{inv.next_action_type}</p>
                      )}
                    </div>
                  ) : "—"}
                </td>
                <td className="py-3 px-4">
                  {inv.cadence_status ? (
                    <span className={`text-xs font-medium ${cadenceColors[inv.cadence_status] || 'text-slate-400'}`}>
                      {inv.cadence_status}
                    </span>
                  ) : "—"}
                </td>
                <td className="py-3 px-4 text-muted-foreground text-xs">
                  {inv.last_contact_date
                    ? new Date(inv.last_contact_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : "—"
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}