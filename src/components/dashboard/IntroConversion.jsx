import React from "react";
import { Network } from "lucide-react";

export default function IntroConversion({ investors }) {
  const introTypes = ["Direct", "Warm", "Cold"];
  
  const introColors = {
    Direct: { bg: "bg-emerald-500", text: "text-emerald-700" },
    Warm: { bg: "bg-blue-500", text: "text-blue-700" },
    Cold: { bg: "bg-slate-400", text: "text-slate-600" },
  };

  const stats = introTypes.map((type) => {
    const filtered = investors.filter(inv => inv.intro_strength === type);
    const total = filtered.length;
    const engaged = filtered.filter(inv => 
      inv.status === "Engaged" || inv.status === "Committed"
    ).length;
    const committed = filtered.filter(inv => inv.status === "Committed").length;
    
    const engagementRate = total > 0 ? ((engaged / total) * 100).toFixed(0) : 0;
    const conversionRate = total > 0 ? ((committed / total) * 100).toFixed(0) : 0;
    
    return {
      type,
      total,
      engaged,
      committed,
      engagementRate,
      conversionRate,
    };
  });

  const totalTracked = stats.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="glass rounded-xl p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Intro Conversion</h2>
          <p className="text-slate-400 text-xs mt-1">{totalTracked} intros tracked</p>
        </div>
        <Network className="w-5 h-5 text-violet-600" />
      </div>

      <div className="space-y-4">
        {stats.map(({ type, total, engaged, committed, engagementRate, conversionRate }) => {
          const colors = introColors[type];
          
          return (
            <div key={type} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                  <span className="text-sm font-semibold text-foreground">{type}</span>
                </div>
                <span className="text-xs text-muted-foreground">{total} contacts</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Engagement</p>
                  <p className="text-lg font-bold text-foreground">{engagementRate}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{engaged} engaged</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Conversion</p>
                  <p className="text-lg font-bold text-foreground">{conversionRate}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{committed} committed</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}