import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const statusColors = {
  Warm: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Engaged: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Passed: "bg-white/[0.06] text-white/30 border-white/[0.08]",
  Committed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
};

const strengthColors = {
  New: "text-white/30",
  Building: "text-amber-400/70",
  Strong: "text-blue-400/70",
  Champion: "text-emerald-400/70",
};

const cadenceColors = {
  "On Track": "text-emerald-400/70",
  "Overdue": "text-red-400/70",
  "Waiting": "text-amber-400/70",
  "Closed": "text-white/30",
};

export default function InvestorTable({ investors, sortField, sortDir, onSort, onEdit }) {
  const SortHeader = ({ field, children }) => (
    <th
      className="text-left text-[10px] uppercase tracking-[0.15em] text-white/35 font-medium py-3 px-4 cursor-pointer hover:text-white/50 transition-colors select-none"
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
        <p className="text-white/30 text-sm">No investors tracked yet. Add your first investor contact.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="firm">Firm</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="relationship_strength">Strength</SortHeader>
              <SortHeader field="next_action_date">Next Action</SortHeader>
              <SortHeader field="cadence_status">Cadence</SortHeader>
              <SortHeader field="last_contact_date">Last Contact</SortHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {investors.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => onEdit(inv)}
                className="hover:bg-white/[0.03] cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-medium text-white">{inv.name}</td>
                <td className="py-3 px-4 text-white/50">{inv.firm || "—"}</td>
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
                      <p className="text-white/60 text-xs">
                        {new Date(inv.next_action_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {inv.next_action_type && (
                        <p className="text-white/25 text-[10px] mt-0.5">{inv.next_action_type}</p>
                      )}
                    </div>
                  ) : "—"}
                </td>
                <td className="py-3 px-4">
                  {inv.cadence_status ? (
                    <span className={`text-xs font-medium ${cadenceColors[inv.cadence_status] || 'text-white/30'}`}>
                      {inv.cadence_status}
                    </span>
                  ) : "—"}
                </td>
                <td className="py-3 px-4 text-white/30 text-xs">
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