import React from "react";
import { Heart } from "lucide-react";

export default function SentimentOverview({ investors }) {
  const sentiments = ["Champion", "Positive", "Curious", "Neutral", "Skeptical"];
  
  const sentimentColors = {
    Champion: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
    Positive: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" },
    Curious: { bg: "bg-indigo-50", text: "text-indigo-700", bar: "bg-indigo-500" },
    Neutral: { bg: "bg-slate-50", text: "text-slate-600", bar: "bg-slate-400" },
    Skeptical: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  };

  const counts = sentiments.map((sentiment) => ({
    sentiment,
    count: investors.filter(inv => inv.sentiment === sentiment).length,
  }));

  const totalWithSentiment = counts.reduce((sum, s) => sum + s.count, 0);

  // Aggregate objections
  const objectionCounts = {};
  investors.forEach(inv => {
    if (inv.objections && Array.isArray(inv.objections)) {
      inv.objections.forEach(obj => {
        objectionCounts[obj] = (objectionCounts[obj] || 0) + 1;
      });
    }
  });

  const topObjections = Object.entries(objectionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="glass rounded-xl p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Investor Sentiment</h2>
          <p className="text-slate-400 text-xs mt-1">{totalWithSentiment} investors profiled</p>
        </div>
        <Heart className="w-5 h-5 text-violet-600" />
      </div>

      <div className="space-y-3">
        {counts.map(({ sentiment, count }) => {
          const percentage = totalWithSentiment > 0 ? (count / totalWithSentiment) * 100 : 0;
          const colors = sentimentColors[sentiment];
          
          return (
            <div key={sentiment}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-foreground font-medium">{sentiment}</span>
                <span className="text-xs text-muted-foreground font-semibold">{count}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.bar} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {topObjections.length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Top Objections</p>
          <div className="space-y-2">
            {topObjections.map(([objection, count]) => (
              <div key={objection} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{objection}</span>
                <span className="text-xs font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}