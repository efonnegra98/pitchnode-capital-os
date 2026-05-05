import React from "react";
import { Eye, FileText } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

export default function InvestorViewFeed({ shares }) {
  // Only show opened full_room shares, most recent first, limit 5
  const views = [...shares]
    .filter(s => s.opened && s.share_type === "full_room")
    .sort((a, b) => new Date(b.opened_date || b.sent_date) - new Date(a.opened_date || a.sent_date))
    .slice(0, 5);

  return (
    <div className="mt-6 pt-5 border-t border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-widest">Live Activity Feed</h3>
        </div>
      </div>

      {views.length === 0 ? (
        <div className="flex items-center gap-3 py-5 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <Eye className="w-5 h-5 text-slate-300 flex-shrink-0" />
          <p className="text-sm text-slate-400">No investors have viewed your data room yet — share your link to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {views.map((share) => {
            const ago = timeAgo(share.opened_date || share.sent_date);
            const who = share.investor_name || share.investor_email || "Anonymous viewer";
            const firm = share.firm_name;
            const docs = share.documents_opened?.length > 0 ? share.documents_opened : null;

            return (
              <div key={share.id} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/40">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 leading-snug">
                    <span className="font-semibold">{who}</span>
                    {firm && <span className="text-slate-500"> from {firm}</span>}
                    <span className="text-slate-600"> viewed your data room</span>
                    {ago && <span className="text-slate-400"> · {ago}</span>}
                    {docs && (
                      <span className="text-slate-500">
                        {" — opened "}
                        {docs.map((d, i) => (
                          <span key={d}>
                            <span className="inline-flex items-center gap-0.5 font-medium text-violet-700">
                              <FileText className="w-3 h-3" />{d}
                            </span>
                            {i < docs.length - 1 && <span> and </span>}
                          </span>
                        ))}
                      </span>
                    )}
                  </p>
                  {share.label && (
                    <p className="text-[10px] text-slate-400 mt-0.5">via "{share.label}"</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
                    {share.view_count > 1 ? `${share.view_count}x` : "Viewed"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}