import React from "react";
import { X, FileEdit, Plus } from "lucide-react";

export default function DuplicateDraftModal({ draft, onOpenExisting, onCreateNew, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Draft Already Exists</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            You already have a draft for{" "}
            <span className="font-semibold text-slate-800">{draft.month}</span>.
            Would you like to continue editing it, or create a new one anyway?
          </p>

          <div className="space-y-2">
            <button
              onClick={onOpenExisting}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 text-left transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <FileEdit className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-700">Continue editing existing draft</p>
                <p className="text-xs text-violet-500 mt-0.5">{draft.month}</p>
              </div>
            </button>

            <button
              onClick={onCreateNew}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Create a new update anyway</p>
                <p className="text-xs text-slate-400 mt-0.5">Both drafts will be kept</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}