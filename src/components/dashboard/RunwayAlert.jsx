import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function RunwayAlert({ months }) {
  if (!months || isNaN(months)) return null;

  if (months < 6) {
    return (
      <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-red-700 font-medium leading-snug">Critical: Less than 6 months of runway. Prioritize closing capital immediately.</p>
      </div>
    );
  }
  if (months < 12) {
    return (
      <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-orange-700 font-medium leading-snug">Warning: Under 12 months runway. Accelerate your raise.</p>
      </div>
    );
  }
  return null;
}

export function runwayColor(months) {
  if (!months || isNaN(months)) return "text-slate-800";
  if (months >= 18) return "text-emerald-700";
  if (months >= 12) return "text-amber-600";
  if (months >= 6) return "text-orange-600";
  return "text-red-600";
}