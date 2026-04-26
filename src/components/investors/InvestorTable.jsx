import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Send, Pencil, Trash2 } from "lucide-react";
import { suggestNextActionLabel } from "../../lib/nextActionSuggestion";

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
  if (!dateStr) return { days: null, level: "none" };
  const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (days >= 21) return { days, level: "critical" };
  if (days >= 14) return { days, level: "high" };
  if (days >= 7)  return { days, level: "medium" };
  return { days, level: "ok" };
}

function formatRelative(days) {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ActionMenu({ inv, onEdit, onFollowUp, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onFollowUp(inv); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <Send className="w-3.5 h-3.5 text-slate-400" />
            Log Activity
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(inv); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
            Edit Investor
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(inv); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Investor
          </button>
        </div>
      )}
    </div>
  );
}

function AgingBadge({ critical }) {
  const [show, setShow] = useState(false);
  const label = critical ? "Stale" : "Aging";
  const colors = critical ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600";
  const tip = critical
    ? "No contact in 21+ days — this relationship is going cold. Follow up immediately."
    : "No contact in 14+ days — this relationship may be going cold. Follow up soon.";

  return (
    <div className="relative inline-block">
      <span
        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded cursor-help ${colors}`}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {label}
      </span>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed pointer-events-none whitespace-normal text-center">
          {tip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

function LastNoteTooltip({ note }) {
  const [show, setShow] = useState(false);
  if (!note) return null;

  return (
    <div className="relative inline-block">
      <span
        className="text-[10px] text-slate-400 italic truncate max-w-[140px] block cursor-help underline decoration-dotted"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        "{note.length > 40 ? note.slice(0, 40) + "…" : note}"
      </span>
      {show && (
        <div className="absolute z-50 bottom-full left-0 mb-1 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl leading-relaxed">
          {note}
          <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

export default function InvestorTable({ investors, sortField, sortDir, onSort, onEdit, onFollowUp, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDeleteConfirm = () => {
    if (deleteTarget) onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };
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

  const DeleteConfirmModal = deleteTarget ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm mx-4 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Delete Investor</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-medium text-slate-700">
            {deleteTarget.name || deleteTarget.firm || "this investor"}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (investors.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-muted-foreground text-sm">No investors tracked yet. Add your first investor contact.</p>
      </div>
    );
  }

  return (
    <>
      {DeleteConfirmModal}
      <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60">
              <SortHeader field="name">Name / Firm</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="funnel_stage">Stage</SortHeader>
              <SortHeader field="next_action_date">Next Action</SortHeader>
              <SortHeader field="last_contact_date">Last Contact</SortHeader>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {investors.map((inv) => {
              const staleness = getStaleness(inv.last_contact_date);
              const isCritical = staleness.level === "critical";
              const isHigh = staleness.level === "high";
              const isMedium = staleness.level === "medium";

              const rowBg = isCritical
                ? "bg-red-50/50 hover:bg-red-50/80"
                : isHigh
                ? "bg-orange-50/30 hover:bg-orange-50/60"
                : "hover:bg-slate-50";

              return (
                <tr
                  key={inv.id}
                  onClick={() => onEdit(inv)}
                  className={`cursor-pointer transition-colors ${rowBg}`}
                >
                  {/* Name + Firm */}
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground text-sm">{inv.name || <span className="text-slate-400 italic">No name</span>}</p>
                    {inv.firm && <p className="text-xs text-muted-foreground mt-0.5">{inv.firm}</p>}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {inv.status ? (
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border ${statusColors[inv.status] || ""}`}>
                        {inv.status}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Funnel Stage */}
                  <td className="py-3 px-4">
                    <span className="text-xs text-slate-500">{inv.funnel_stage || "—"}</span>
                  </td>

                  {/* Next Action */}
                  <td className="py-3 px-4">
                    {inv.next_action_date ? (
                      <div>
                        <p className="text-foreground text-xs font-medium">
                          {new Date(inv.next_action_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        <p className="text-muted-foreground text-[10px] mt-0.5">
                          {suggestNextActionLabel(inv)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[10px] text-slate-400 italic">{suggestNextActionLabel(inv)}</p>
                      </div>
                    )}
                    {inv.last_note && <LastNoteTooltip note={inv.last_note} />}
                  </td>

                  {/* Last Contact — prominent staleness */}
                  <td className="py-3 px-4">
                    {staleness.days !== null ? (
                      <div className="flex items-center gap-2">
                        <div>
                          <p className={`text-sm font-semibold ${
                            isCritical ? "text-red-600"
                            : isHigh ? "text-orange-500"
                            : isMedium ? "text-amber-600"
                            : "text-slate-700"
                          }`}>
                            {formatRelative(staleness.days)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatShortDate(inv.last_contact_date)}
                          </p>
                        </div>
                        {(isCritical || isHigh) && (
                          <AgingBadge critical={isCritical} />
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-red-400 font-medium italic">Never</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <ActionMenu
                      inv={inv}
                      onEdit={onEdit}
                      onFollowUp={onFollowUp}
                      onDelete={(inv) => setDeleteTarget(inv)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
      </>
      );
      }