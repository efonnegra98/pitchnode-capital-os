import React from "react";
import { BarChart2 } from "lucide-react";

function getInterestLevel(views, maxViews) {
  if (maxViews === 0) return { label: "—", color: "text-slate-400", bar: "bg-slate-200", pct: 0 };
  const ratio = views / maxViews;
  if (ratio >= 0.66) return { label: "High", color: "text-emerald-700", bar: "bg-emerald-500", pct: Math.round(ratio * 100) };
  if (ratio >= 0.33) return { label: "Medium", color: "text-amber-700", bar: "bg-amber-400", pct: Math.round(ratio * 100) };
  return { label: "Low", color: "text-slate-500", bar: "bg-slate-300", pct: Math.round(ratio * 100) };
}

export default function DocumentInsights({ items, shares }) {
  // Only uploaded docs
  const docs = items.filter(i => i.file_url && i.file_name);
  if (docs.length === 0) return null;

  // Count unique investors who opened each document across all shares
  const docStats = docs.map(doc => {
    const docShares = shares.filter(s =>
      s.opened && (
        (s.share_type === "document" && s.document_name === doc.item_name) ||
        (s.documents_opened && s.documents_opened.includes(doc.item_name))
      )
    );
    const uniqueInvestors = new Set(docShares.map(s => s.investor_email || s.investor_name || s.share_id)).size;
    return { doc, views: uniqueInvestors };
  }).sort((a, b) => b.views - a.views);

  const maxViews = Math.max(...docStats.map(d => d.views), 1);

  return (
    <div className="mt-5 pt-5 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Document Insights</h3>
      </div>
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">Document</th>
              <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2.5">Views</th>
              <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2.5 w-40">Interest</th>
              <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2.5">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docStats.map(({ doc, views }) => {
              const interest = getInterestLevel(views, maxViews);
              return (
                <tr key={doc.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="text-sm font-medium text-slate-700 truncate block max-w-[200px]">{doc.item_name}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="text-sm font-bold text-slate-800">{views}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${interest.bar} rounded-full transition-all duration-500`} style={{ width: `${interest.pct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[10px] font-bold ${interest.color}`}>{interest.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}