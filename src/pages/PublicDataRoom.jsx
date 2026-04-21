import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Download, ExternalLink, FileText, Lock } from "lucide-react";

export default function PublicDataRoom() {
  const { shareId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null); // { company, items, share }

  useEffect(() => {
    if (!shareId) return;
    loadDataRoom();
  }, [shareId]);

  const loadDataRoom = async () => {
    try {
      setLoading(true);

      // Find the share record
      const shares = await base44.entities.DataRoomShare.filter({ share_id: shareId });
      if (!shares || shares.length === 0) {
        setError("This data room link is invalid or has expired.");
        setLoading(false);
        return;
      }
      const share = shares[0];

      // Load company
      const companies = await base44.entities.Company.filter({ id: share.company_id });
      const company = companies[0] || null;

      // Load completed readiness items
      const allItems = await base44.entities.RaiseReadinessItem.filter({ company_id: share.company_id });
      const completedItems = allItems.filter(i => i.status === "Complete");

      setData({ share, company, items: completedItems, totalItems: allItems.length });

      // Mark as opened if not already
      if (!share.opened) {
        await base44.entities.DataRoomShare.update(share.id, {
          opened: true,
          opened_date: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError("Unable to load this data room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading data room…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Link Not Found</h2>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const { company, items, totalItems } = data;
  const companyName = company?.name || "Company";
  const readinessScore = totalItems > 0 ? Math.round((items.length / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-violet-600 font-semibold mb-1">Confidential — Investor Data Room</p>
            <h1 className="text-xl font-bold text-slate-900">{companyName} — Data Room</h1>
          </div>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png"
            alt="Capital OS"
            className="h-8 w-auto opacity-80"
          />
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Readiness Score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 flex items-center gap-6 shadow-sm">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-medium">Raise Readiness Score</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-violet-600 tabular-nums">{readinessScore}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{items.length} of {totalItems} documents complete</p>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Available Documents</h2>

          {items.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No documents have been marked as complete yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...items].sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-violet-200 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{item.item_name}</p>
                    {item.file_name && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{item.file_name}</p>
                    )}
                    {!item.file_url && item.notes && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.notes}</p>
                    )}
                  </div>
                  {item.file_url ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200 text-xs font-medium hover:bg-violet-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View
                      </a>
                      <a
                        href={item.file_url}
                        download={item.file_name || true}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium hover:bg-slate-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 flex-shrink-0">
                      File pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confidentiality notice */}
        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          <strong>Confidential:</strong> This data room is intended solely for the named recipient. Please do not share or distribute its contents without authorization.
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center">
        <p className="text-[11px] text-slate-400">Powered by <span className="font-semibold text-slate-500">Capital OS</span></p>
      </footer>
    </div>
  );
}