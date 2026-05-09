/**
 * MobilePickerSheet — iOS-style bottom sheet picker for select controls on mobile.
 * On desktop it renders a normal <select>. On mobile it shows a bottom sheet.
 */
import React, { useState } from "react";
import { Check, X } from "lucide-react";

export default function MobilePickerSheet({ value, onChange, options, placeholder, className }) {
  const [open, setOpen] = useState(false);

  const selected = options.find(o => (typeof o === "string" ? o : o.value) === value);
  const label = selected ? (typeof selected === "string" ? selected : selected.label) : placeholder || "Select…";

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground flex-shrink-0 text-left min-h-[36px] ${className || ""}`}
      >
        {label}
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
          />
          <div
            className="relative w-full bg-card rounded-t-2xl border-t border-border animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: "70vh", display: "flex", flexDirection: "column" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <span className="text-sm font-semibold text-foreground">{placeholder || "Select"}</span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Options list */}
            <div className="overflow-y-auto flex-1">
              {options.map(opt => {
                const val = typeof opt === "string" ? opt : opt.value;
                const lbl = typeof opt === "string" ? opt : opt.label;
                const isSelected = val === value;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelect(val)}
                    className="w-full flex items-center justify-between px-5 text-sm text-foreground border-b border-border last:border-0 active:bg-accent transition-colors"
                    style={{ minHeight: 52 }}
                  >
                    <span className={isSelected ? "text-violet-600 font-medium" : ""}>{lbl}</span>
                    {isSelected && <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop: hidden native select for non-mobile */}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="hidden sm:block text-xs border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-violet-400 flex-shrink-0"
      >
        {options.map(opt => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </>
  );
}