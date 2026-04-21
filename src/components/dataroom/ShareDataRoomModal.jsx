import React, { useState } from "react";
import { X, Copy, Check, Link2 } from "lucide-react";

export default function ShareDataRoomModal({ shareUrl, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-violet-600" />
            <h2 className="text-base font-semibold text-slate-800">Share Data Room</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-slate-500 mb-4">
            Anyone with this link can view your data room documents. Share it securely with investors.
          </p>

          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-sm text-slate-700 flex-1 truncate font-mono">{shareUrl}</span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                copied
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-violet-600 text-white hover:bg-violet-700"
              }`}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-3">
            This link is persistent and will always point to your latest data room.
          </p>
        </div>
      </div>
    </div>
  );
}