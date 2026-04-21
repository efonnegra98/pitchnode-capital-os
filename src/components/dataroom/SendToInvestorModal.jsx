import React, { useState } from "react";
import { X, Send, Check, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SendToInvestorModal({ investors, shareUrl, onSend, onClose, isSending }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(
    `Hi [Investor Name],\n\nPlease find our data room here: ${shareUrl}\n\nLet me know if you have any questions.\n\nBest,`
  );

  const filtered = investors.filter((inv) => {
    const q = search.toLowerCase();
    return (
      (inv.name || "").toLowerCase().includes(q) ||
      (inv.firm || "").toLowerCase().includes(q)
    );
  });

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedInvestors = investors.filter((i) => selected.includes(i.id));

  const handleSend = () => {
    onSend(selectedInvestors, message);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-violet-600" />
            <h2 className="text-base font-semibold text-slate-800">Send to Investor</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Investor selector */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-2 block">
              Select Investors
            </label>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search investors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400"
              />
            </div>
            {investors.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No investors in your CRM yet.</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2">
                {filtered.map((inv) => {
                  const isSelected = selected.includes(inv.id);
                  return (
                    <button
                      key={inv.id}
                      onClick={() => toggle(inv.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isSelected ? "bg-violet-50 border border-violet-200" : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-violet-600 border-violet-600" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{inv.name || inv.firm || "Unnamed"}</p>
                        {inv.firm && inv.name && <p className="text-xs text-slate-400 truncate">{inv.firm}</p>}
                      </div>
                      {inv.email && <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{inv.email}</span>}
                    </button>
                  );
                })}
              </div>
            )}
            {selected.length > 0 && (
              <p className="text-xs text-violet-600 font-medium mt-2">{selected.length} investor{selected.length > 1 ? "s" : ""} selected</p>
            )}
          </div>

          {/* Message editor */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1.5 block">
              Message (editable)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              className="w-full text-sm text-slate-800 leading-relaxed bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none font-sans placeholder-slate-400 transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={selected.length === 0 || isSending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            {isSending ? "Sending..." : `Send${selected.length > 1 ? ` to ${selected.length}` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}