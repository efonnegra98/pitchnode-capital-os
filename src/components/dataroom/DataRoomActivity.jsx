import React from "react";
import { Eye, Clock, Link2, FileText } from "lucide-react";

export default function DataRoomActivity({ shares }) {
  if (!shares || shares.length === 0) {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200">
        <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-3">Data Room Activity</h3>
        <div className="text-center py-6 text-slate-400 text-sm">
          No shares yet. Send your data room to an investor to start tracking activity.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-5 border-t border-slate-200">
      <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-3">Data Room Activity</h3>
      <div className="space-y-2">
        {shares.map((share) => (
          <div
            key={share.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-100 bg-slate-50/50"
          >
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
              {share.share_type === "document" ? (
                <FileText className="w-3.5 h-3.5 text-violet-500" />
              ) : (
                <Link2 className="w-3.5 h-3.5 text-violet-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {share.investor_name || "Link shared"}
                {share.document_name && (
                  <span className="text-slate-400 font-normal"> — {share.document_name}</span>
                )}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-400">
                  {share.sent_date
                    ? new Date(share.sent_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
                {share.share_type === "document" && (
                  <span className="text-[10px] text-slate-400">· Document share</span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              {share.opened ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <Eye className="w-3 h-3" /> Opened
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                  Not yet viewed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}