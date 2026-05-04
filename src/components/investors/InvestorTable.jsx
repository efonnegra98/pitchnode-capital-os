import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Send, Pencil, Trash2, Globe, Linkedin } from "lucide-react";
import { suggestNextActionLabel } from "../../lib/nextActionSuggestion";

const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

function getAvatarColor(str) {
  const s = str || "?";
  return avatarColors[s.charCodeAt(0) % avatarColors.length];
}

function getInitials(firm, name) {
  if (firm?.trim()) return firm.trim()[0].toUpperCase();
  if (name?.trim()) return name.trim()[0].toUpperCase();
  return "?";
}

const statusColors = {
  Warm: "bg-amber-50 text-amber-700 border-amber-200",
  Engaged: "bg-blue-50 text-blue-700 border-blue-200",
  Passed: "bg-slate-100 text-slate-500 border-slate-200",
  Committed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const firmTypeColors = {
  "Venture Capital": "bg-violet-50 text-violet-700",
  "Angel": "bg-amber-50 text-amber-700",
  "Family Office": "bg-blue-50 text-blue-700",
  "Corporate / Strategic": "bg-slate-100 text-slate-600",
  "Accelerator": "bg-emerald-50 text-emerald-700",
  "Private Equity": "bg-indigo-50 text-indigo-700",
  "Other": "bg-slate-50 text-slate-500",
};

// ── Relationship Strength Score ─────────────────────────────────────────────
// Returns { score: 1-5, level: "strong"|"warm"|"cold"|"at_risk", label }
function calcRelationshipScore(inv) {
  let score = 0;

  // 1. Interactions logged (activity_log length)
  const interactions = (inv.activity_log || []).length;
  if (interactions >= 5) score += 2;
  else if (interactions >= 2) score += 1;

  // 2. Days since last contact
  const daysSince = inv.last_contact_date
    ? Math.floor((new Date() - new Date(inv.last_contact_date)) / (1000 * 60 * 60 * 24))
    : null;
  if (daysSince === null) score += 0;
  else if (daysSince <= 7)  score += 2;
  else if (daysSince <= 14) score += 1;
  // 14+ days adds 0

  // 3. Pipeline stage depth
  const stageScore = {
    "Identified": 0, "Contacted": 0, "Intro Call": 1,
    "Partner Meeting": 1, "Due Diligence": 2, "Soft Commit": 2, "Hard Commit": 2,
  };
  score += stageScore[inv.funnel_stage] ?? 0;

  // 4. Positive sentiment signals
  if (inv.sentiment === "Champion" || inv.sentiment === "Positive") score += 1;

  // Cap at 5
  const capped = Math.min(score, 5);

  // Classify
  // At Risk: had contact but gone stale despite early engagement
  const atRisk = daysSince !== null && daysSince >= 21 && capped < 3;
  if (atRisk) return { score: capped, level: "at_risk", label: "At Risk" };
  if (capped >= 4) return { score: capped, level: "strong", label: "Strong" };
  if (capped >= 2) return { score: capped, level: "warm", label: "Warm" };
  return { score: capped, level: "cold", label: "Cold" };
}

const relColors = {
  strong:  { dot: "bg-emerald-500", empty: "bg-emerald-100", label: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  warm:    { dot: "bg-amber-400",   empty: "bg-amber-100",   label: "text-amber-700 bg-amber-50 border-amber-200"   },
  cold:    { dot: "bg-slate-300",   empty: "bg-slate-100",   label: "text-slate-500 bg-slate-50 border-slate-200"   },
  at_risk: { dot: "bg-red-500",     empty: "bg-red-100",     label: "text-red-700 bg-red-50 border-red-200"         },
};

function RelStrengthIndicator({ inv }) {
  const [show, setShow] = useState(false);
  const { score, level, label } = calcRelationshipScore(inv);
  const c = relColors[level];

  const tips = {
    strong:  "Strong relationship — keep the momentum going.",
    warm:    "Warming up — consistent follow-up will deepen the bond.",
    cold:    "Cold — limited interactions or no recent contact.",
    at_risk: "At risk — was engaged but contact has gone stale.",
  };

  return (
    <div className="relative inline-flex flex-col gap-1.5 items-start"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {/* Dot bar */}
      <div className="flex items-center gap-1 cursor-default">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${i <= score ? c.dot : c.empty}`}
          />
        ))}
      </div>
      {/* Label */}
      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${c.label}`}>
        {label}
      </span>

      {/* Tooltip */}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed pointer-events-none whitespace-normal text-center">
          <p className="font-semibold mb-0.5">{label} Relationship</p>
          <p className="text-slate-300">{tips[level]}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

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
            <Send className="w-3.5 h-3.5 text-slate-400" /> Log Activity
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(inv); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit Firm
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(inv); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
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
    ? "No contact in 21+ days — follow up immediately."
    : "No contact in 14+ days — follow up soon.";

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

export default function InvestorTable({ investors, sortField, sortDir, onSort, onEdit, onFollowUp, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const SortHeader = ({ field, children }) => (
    <th
      className="text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium py-3 px-4 cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </span>
    </th>
  );

  const DeleteConfirmModal = deleteTarget ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm mx-4 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Delete Firm</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-medium text-slate-700">{deleteTarget.firm || deleteTarget.name || "this firm"}</span>?
          This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (investors.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-muted-foreground text-sm">No investor firms tracked yet.</p>
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
                <SortHeader field="firm">Firm</SortHeader>
                <SortHeader field="firm_type">Type</SortHeader>
                <SortHeader field="stage_focus">Stage / Check</SortHeader>
                <SortHeader field="status">Status</SortHeader>
                <SortHeader field="funnel_stage">Funnel</SortHeader>
                <SortHeader field="last_contact_date">Last Contact</SortHeader>
                <th className="text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium py-3 px-4 select-none">Rel. Strength</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {investors.map((inv) => {
                const staleness = getStaleness(inv.last_contact_date);
                const isCritical = staleness.level === "critical";
                const isHigh = staleness.level === "high";

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
                    {/* Firm */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${getAvatarColor(inv.firm || inv.name)}`}>
                          {getInitials(inv.firm, inv.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-900 text-sm">{inv.firm || <span className="text-slate-400 italic">No firm name</span>}</p>
                            {inv.website_url && (
                              <a href={inv.website_url} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-slate-600 transition-colors">
                                <Globe className="w-3 h-3" />
                              </a>
                            )}
                            {inv.linkedin_url && (
                              <a href={inv.linkedin_url} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#0077B5] hover:text-[#005885] transition-colors">
                                <Linkedin className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {inv.name && <p className="text-xs text-slate-400 mt-0.5">{inv.name}</p>}
                          {inv.portfolio_count ? (
                            <p className="text-[10px] text-slate-400">{inv.portfolio_count} portfolio cos</p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4">
                      {inv.firm_type ? (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${firmTypeColors[inv.firm_type] || "bg-slate-50 text-slate-500"}`}>
                          {inv.firm_type}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>

                    {/* Stage / Check */}
                    <td className="py-4 px-4">
                      <div>
                        {inv.stage_focus && <p className="text-xs font-medium text-slate-700">{inv.stage_focus}</p>}
                        {inv.check_size && <p className="text-[11px] text-slate-400 mt-0.5">{inv.check_size}</p>}
                        {!inv.stage_focus && !inv.check_size && <span className="text-slate-300 text-xs">—</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {inv.status ? (
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border ${statusColors[inv.status] || ""}`}>
                          {inv.status}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>

                    {/* Funnel Stage */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="text-xs text-slate-600">{inv.funnel_stage || "—"}</span>
                        {inv.next_action_date && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Next: {new Date(inv.next_action_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Last Contact */}
                    <td className="py-4 px-4">
                      {staleness.days !== null ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className={`text-sm font-semibold ${
                              isCritical ? "text-red-600" : isHigh ? "text-orange-500" : "text-slate-700"
                            }`}>
                              {formatRelative(staleness.days)}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatShortDate(inv.last_contact_date)}
                            </p>
                          </div>
                          {(isCritical || isHigh) && <AgingBadge critical={isCritical} />}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Never</span>
                      )}
                    </td>

                    {/* Relationship Strength */}
                    <td className="py-4 px-4">
                      <RelStrengthIndicator inv={inv} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
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