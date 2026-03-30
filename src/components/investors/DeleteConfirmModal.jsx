import React from "react";

export default function DeleteConfirmModal({ investor, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm mx-4 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Delete Investor</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-medium text-slate-700">
            {investor?.name || investor?.firm || "this investor"}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}