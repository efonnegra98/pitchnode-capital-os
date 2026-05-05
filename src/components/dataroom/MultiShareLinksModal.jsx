import React, { useState } from "react";
import { X, Copy, Check, Link2, Plus, Eye, ToggleLeft, ToggleRight, Trash2, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function generateShareId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export default function MultiShareLinksModal({ companyId, shares, onClose }) {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState(null);
  const [newLabel, setNewLabel] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fullRoomShares = shares.filter(s => s.share_type === "full_room" && !s.investor_id);

  const origin = window.location.origin;

  const copy = (shareId, id) => {
    navigator.clipboard.writeText(`${origin}/dataroom/${shareId}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggle = async (share) => {
    await base44.entities.DataRoomShare.update(share.id, { is_active: !share.is_active });
    queryClient.invalidateQueries({ queryKey: ["dataroom-shares", companyId] });
  };

  const remove = async (id) => {
    await base44.entities.DataRoomShare.delete(id);
    queryClient.invalidateQueries({ queryKey: ["dataroom-shares", companyId] });
  };

  const createLink = async () => {
    if (!newLabel.trim()) return;
    setCreating(true);
    const shareId = generateShareId();
    await base44.entities.DataRoomShare.create({
      company_id: companyId,
      share_id: shareId,
      label: newLabel.trim(),
      share_type: "full_room",
      is_active: true,
      expiry_date: newExpiry || null,
      sent_date: new Date().toISOString(),
      view_count: 0,
    });
    queryClient.invalidateQueries({ queryKey: ["dataroom-shares", companyId] });
    setNewLabel("");
    setNewExpiry("");
    setShowCreateForm(false);
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-violet-600" />
            <h2 className="text-base font-semibold text-slate-800">Share Links</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <p className="text-xs text-slate-500">Create trackable links — see exactly who opens your data room and when.</p>

          {/* Existing links */}
          {fullRoomShares.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">No share links yet. Create your first one below.</div>
          ) : (
            <div className="space-y-2">
              {fullRoomShares.map(share => {
                const url = `${origin}/dataroom/${share.share_id}`;
                const isExpired = share.expiry_date && new Date(share.expiry_date) < new Date();
                return (
                  <div key={share.id} className={`rounded-xl border p-3.5 ${share.is_active && !isExpired ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{share.label || "Untitled Link"}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{url}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Toggle */}
                        <button onClick={() => toggle(share)} title={share.is_active ? "Disable link" : "Enable link"} className="text-slate-400 hover:text-violet-600 transition-colors">
                          {share.is_active ? <ToggleRight className="w-5 h-5 text-violet-600" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        {/* Copy */}
                        <button
                          onClick={() => copy(share.share_id, share.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${copiedId === share.id ? "bg-emerald-100 text-emerald-700" : "bg-violet-600 text-white hover:bg-violet-700"}`}
                        >
                          {copiedId === share.id ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                        </button>
                        {/* Delete */}
                        <button onClick={() => remove(share.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Eye className="w-3 h-3" /> {share.view_count || 0} views
                      </span>
                      <span className="text-[10px] text-slate-400">Created {timeAgo(share.sent_date)}</span>
                      {share.expiry_date && (
                        <span className={`flex items-center gap-1 text-[10px] font-medium ${isExpired ? "text-red-600" : "text-amber-600"}`}>
                          <Calendar className="w-3 h-3" />
                          {isExpired ? "Expired" : `Expires ${new Date(share.expiry_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                        </span>
                      )}
                      {!share.is_active && <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Disabled</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create new link form */}
          {showCreateForm ? (
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider">New Share Link</p>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium block mb-1">Label (e.g. "Link for a16z")</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="General Link"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400"
                  onKeyDown={e => e.key === "Enter" && createLink()}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium block mb-1">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={e => setNewExpiry(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createLink}
                  disabled={!newLabel.trim() || creating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-all"
                >
                  {creating ? "Creating…" : "Create Link"}
                </button>
                <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-violet-300 text-violet-600 text-sm font-semibold hover:border-violet-400 hover:bg-violet-50 transition-all"
            >
              <Plus className="w-4 h-4" /> Create New Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}