import React, { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

export default function MetricCard({ label, value, subtext, icon: Icon, trend, trendDirection, onSave, fieldType = "number" }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const isEmpty = value === "—" || value === null || value === undefined;

  const handleEdit = () => {
    // Strip formatting to get raw number for editing
    const raw = typeof value === "string" ? value.replace(/[$,km%\s]/gi, "") : value;
    setInputVal(raw === "—" ? "" : raw);
    setEditing(true);
  };

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleSave = async () => {
    if (!onSave) { setEditing(false); return; }
    setSaving(true);
    await onSave(inputVal === "" ? null : Number(inputVal));
    setSaving(false);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div
      className={`glass rounded-xl p-5 metric-glow transition-all duration-200 relative group ${onSave ? "cursor-pointer hover:ring-1 hover:ring-violet-300 hover:bg-violet-50/20" : ""}`}
      onClick={!editing && onSave ? handleEdit : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-medium">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-violet-600" />
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter value..."
            className="w-full text-lg font-bold text-slate-800 border border-violet-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              <Check className="w-3 h-3" />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(false); }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {isEmpty && onSave ? (
            <div className="flex items-center gap-1.5 text-slate-400 mt-1">
              <Pencil className="w-3.5 h-3.5" />
              <span className="text-sm italic">Click to add</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
              {onSave && (
                <Pencil className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              )}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={`text-xs font-medium ${trendDirection === 'up' ? 'text-emerald-600' : trendDirection === 'down' ? 'text-red-600' : 'text-slate-400'}`}>
                {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '–'} {trend}
              </span>
            )}
            {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
          </div>
        </>
      )}
    </div>
  );
}