import React, { useState } from "react";
import { Eye, FileText, BarChart2, ChevronDown, ChevronUp } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function InvestorRow({ share }) {
  const [expanded, setExpanded] = useState(false);
  const docs = share.documents_opened || [];
  const hasDeck = docs.some(d => /pitch.?deck/i.test(d));

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-violet-700 dark:text-violet-400">
            {(share.investor_name || share.investor_email || "?")[0].toUpperCase()}
          </span>
        </div>

        {/* Name & firm */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {share.investor_name || share.investor_email || "Anonymous"}
          </p>
          {share.firm_name && (
            <p className="text-[11px] text-muted-foreground truncate">{share.firm_name}</p>
          )}
        </div>

        {/* Pitch deck badge */}
        {hasDeck && (
          <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-full px-2 py-0.5 flex-shrink-0">
            Deck ✓
          </span>
        )}

        {/* View count */}
        <span className="text-[11px] font-bold text-foreground bg-muted rounded-full px-2 py-0.5 flex-shrink-0 flex items-center gap-1">
          <Eye className="w-3 h-3 text-muted-foreground" />
          {share.view_count > 0 ? `${share.view_count}x` : "1x"}
        </span>

        {/* Last seen */}
        <span className="text-[11px] text-muted-foreground flex-shrink-0 w-16 text-right">
          {timeAgo(share.opened_date)}
        </span>

        {/* Expand toggle */}
        {docs.length > 0 && (
          <button className="text-muted-foreground flex-shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Documents opened */}
      {expanded && docs.length > 0 && (
        <div className="px-4 pb-3 pt-1 border-t border-border bg-muted/30">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Documents opened</p>
          <div className="flex flex-wrap gap-1.5">
            {docs.map((doc, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border bg-card text-foreground"
              >
                <FileText className="w-3 h-3 text-violet-500 flex-shrink-0" />
                {doc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataRoomAnalytics({ shares }) {
  const opened = shares.filter(s => s.opened && s.share_type === "full_room");

  // Document view totals across all shares
  const docCounts = {};
  shares.forEach(s => {
    if (!s.opened) return;
    (s.documents_opened || []).forEach(doc => {
      docCounts[doc] = (docCounts[doc] || 0) + 1;
    });
  });
  const sortedDocs = Object.entries(docCounts).sort((a, b) => b[1] - a[1]);
  const maxDocViews = sortedDocs[0]?.[1] || 1;

  const totalViews = opened.reduce((sum, s) => sum + (s.view_count || 1), 0);
  const deckViews = opened.filter(s => (s.documents_opened || []).some(d => /pitch.?deck/i.test(d))).length;

  return (
    <div className="mt-6 pt-6 border-t border-border space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Data Room Analytics</h3>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Views", value: totalViews },
          { label: "Unique Investors", value: opened.length },
          { label: "Deck Opens", value: deckViews },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Document engagement bar chart */}
      {sortedDocs.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Document Engagement</p>
          <div className="space-y-2">
            {sortedDocs.map(([doc, count]) => {
              const pct = Math.round((count / maxDocViews) * 100);
              const isPitchDeck = /pitch.?deck/i.test(doc);
              return (
                <div key={doc} className="flex items-center gap-3">
                  <div className="w-36 min-w-[9rem] truncate text-xs text-foreground font-medium flex items-center gap-1">
                    {isPitchDeck && <FileText className="w-3 h-3 text-violet-500 flex-shrink-0" />}
                    <span className="truncate">{doc}</span>
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isPitchDeck ? "bg-violet-500" : "bg-slate-400 dark:bg-slate-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-investor breakdown */}
      {opened.length > 0 ? (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Investor Breakdown</p>
          <div className="space-y-2">
            {[...opened]
              .sort((a, b) => new Date(b.opened_date || b.sent_date) - new Date(a.opened_date || a.sent_date))
              .map(share => (
                <InvestorRow key={share.id} share={share} />
              ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 py-5 px-4 rounded-xl bg-muted/50 border border-dashed border-border">
          <Eye className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">No investors have viewed your data room yet — share your link to start tracking.</p>
        </div>
      )}
    </div>
  );
}