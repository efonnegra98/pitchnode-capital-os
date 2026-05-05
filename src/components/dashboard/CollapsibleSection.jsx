import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CollapsibleSection({ title, children, defaultOpen = true, badge = null, id }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-6" id={id}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 mb-3 group w-full text-left"
      >
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
          {title}
        </span>
        {badge != null && (
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
        <div className="flex-1 h-px bg-slate-100 ml-1" />
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-all duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}