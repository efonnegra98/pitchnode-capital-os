import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Users } from "lucide-react";

export default function RecipientSelector({ investors, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeInvestors = investors.filter(i =>
    !["Closed Lost", "Pass", "Closed Won"].includes(i.funnel_stage)
  );

  const allIds = investors.map(i => i.id);
  const activeIds = activeInvestors.map(i => i.id);
  const isAll = selectedIds.length === allIds.length && allIds.length > 0;
  const isActive = selectedIds.length === activeIds.length && activeIds.length > 0 && !isAll;

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const label = selectedIds.length === 0
    ? "Select recipients"
    : `Sending to ${selectedIds.length} investor${selectedIds.length !== 1 ? "s" : ""}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 hover:border-violet-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className={selectedIds.length === 0 ? "text-slate-400" : "font-medium text-violet-700"}>{label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
          {/* Quick selects */}
          <div className="p-2 border-b border-slate-100 space-y-1">
            <button
              onClick={() => { onChange(allIds); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isAll ? "bg-violet-50 text-violet-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {isAll && <Check className="w-3.5 h-3.5" />}
              <span className={isAll ? "" : "ml-5"}>All Investors ({investors.length})</span>
            </button>
            <button
              onClick={() => { onChange(activeIds); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-violet-50 text-violet-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {isActive && <Check className="w-3.5 h-3.5" />}
              <span className={isActive ? "" : "ml-5"}>Active Pipeline Only ({activeInvestors.length})</span>
            </button>
          </div>

          {/* Individual investors */}
          <div className="p-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-3 py-1.5">Individual Investors</p>
            {investors.map((inv) => {
              const checked = selectedIds.includes(inv.id);
              return (
                <button
                  key={inv.id}
                  onClick={() => toggle(inv.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${checked ? "bg-violet-50 text-violet-700" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? "bg-violet-600 border-violet-600" : "border-slate-300"}`}>
                    {checked && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className="font-medium truncate">{inv.firm || inv.name || "Unnamed"}</span>
                  {inv.name && inv.firm && <span className="text-slate-400 text-xs truncate">· {inv.name}</span>}
                  {inv.email && <span className="text-[10px] text-slate-300 ml-auto truncate">{inv.email}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}