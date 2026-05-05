import React from "react";

function computeScore({ company, investors, updates, readinessItems }) {
  let score = 0;
  const insights = [];

  // 1. Committed capital > 0% of target (+20)
  const target = company?.target_raise_amount || 0;
  const committed = company?.capital_committed || 0;
  if (target > 0 && committed > 0) {
    score += 20;
    const pct = Math.round((committed / target) * 100);
    insights.push({ positive: true, text: `${pct}% of round committed`, section: "round-overview" });
  } else {
    insights.push({ positive: false, text: "No committed capital recorded yet", section: "round-overview" });
  }

  // 2. Investor CRM count (+15 for 10+, +8 for 5-9)
  const invCount = investors.length;
  if (invCount >= 10) {
    score += 15;
    insights.push({ positive: true, text: `${invCount} investors in pipeline`, section: "investors" });
  } else if (invCount >= 5) {
    score += 8;
    insights.push({ positive: true, text: `${invCount} investors tracked (add more for full points)`, section: "investors" });
  } else {
    insights.push({ positive: false, text: `Only ${invCount} investor${invCount !== 1 ? "s" : ""} — aim for 10+`, section: "investors" });
  }

  // 3. At least 1 investor in Diligence or beyond (+15)
  const advancedStages = ["Diligence", "Term Sheet", "Closed Won"];
  const inDiligence = investors.some(i => advancedStages.includes(i.funnel_stage));
  if (inDiligence) {
    score += 15;
    insights.push({ positive: true, text: "Investor in Diligence or beyond", section: "funnel-analytics" });
  } else {
    insights.push({ positive: false, text: "No investors in Diligence yet", section: "funnel-analytics" });
  }

  // 4. Data room readiness (+20 for >80%, +10 for 50-79%)
  const total = readinessItems.length;
  const complete = readinessItems.filter(i => i.status === "Complete").length;
  const readinessPct = total > 0 ? Math.round((complete / total) * 100) : 0;
  if (total > 0 && readinessPct >= 80) {
    score += 20;
    insights.push({ positive: true, text: `Data room is investor-ready (${readinessPct}%)`, section: "raise-readiness" });
  } else if (total > 0 && readinessPct >= 50) {
    score += 10;
    insights.push({ positive: false, text: `Data room at ${readinessPct}% — push to 80%+`, section: "raise-readiness" });
  } else {
    insights.push({ positive: false, text: "Data room incomplete or not started", section: "raise-readiness" });
  }

  // 5. Has sent at least 1 investor update (+15)
  const hasSentUpdate = updates.some(u => u.status === "sent");
  if (hasSentUpdate) {
    score += 15;
    insights.push({ positive: true, text: "Investor updates are being sent", section: "financial-metrics" });
  } else {
    insights.push({ positive: false, text: "No investor updates sent yet", section: "financial-metrics" });
  }

  // 6. Last investor contact within 7 days (+15)
  const recentContact = investors.some(i => {
    if (!i.last_contact_date) return false;
    const days = Math.floor((new Date() - new Date(i.last_contact_date)) / (1000 * 60 * 60 * 24));
    return days <= 7;
  });
  if (recentContact) {
    score += 15;
    insights.push({ positive: true, text: "Active outreach — contact in last 7 days", section: "action-required" });
  } else {
    insights.push({ positive: false, text: "No investor contact in 7+ days", section: "action-required" });
  }

  // Sort: negatives first (things to fix), positives second
  insights.sort((a, b) => a.positive - b.positive);

  return { score: Math.min(score, 100), insights: insights.slice(0, 3) };
}

function getStatus(score) {
  if (score >= 90) return { label: "On Track", color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700", ring: "#10b981" };
  if (score >= 70) return { label: "Good Progress", color: "#3b82f6", bg: "bg-blue-50", text: "text-blue-700", ring: "#3b82f6" };
  if (score >= 50) return { label: "Needs Attention", color: "#f59e0b", bg: "bg-amber-50", text: "text-amber-700", ring: "#f59e0b" };
  if (score >= 30) return { label: "At Risk", color: "#f97316", bg: "bg-orange-50", text: "text-orange-700", ring: "#f97316" };
  return { label: "Critical", color: "#ef4444", bg: "bg-red-50", text: "text-red-700", ring: "#ef4444" };
}

// SVG arc gauge
function ArcGauge({ score, color }) {
  const size = 80;
  const strokeWidth = 7;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc goes from 210deg to 330deg (spans 300deg = 5/6 of circle)
  const startAngle = 210;
  const endAngle = 330; // wraps: 210 → 360 → 330 = 300deg total
  const totalDeg = 300;
  const fillDeg = (score / 100) * totalDeg;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcPath = (from, to) => {
    const start = {
      x: cx + r * Math.cos(toRad(from)),
      y: cy + r * Math.sin(toRad(from)),
    };
    const end = {
      x: cx + r * Math.cos(toRad(to)),
      y: cy + r * Math.sin(toRad(to)),
    };
    const large = to - from > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  };

  // Track: 210 → 510 (=150 mod 360)
  const trackEnd = startAngle + totalDeg; // 510

  // Fill arc ends at startAngle + fillDeg
  const fillEnd = startAngle + fillDeg;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <path
        d={arcPath(startAngle, trackEnd)}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Fill */}
      {score > 0 && (
        <path
          d={arcPath(startAngle, fillEnd)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      )}
    </svg>
  );
}

export default function RaiseHealthScore({ company, investors, updates, readinessItems }) {
  const { score, insights } = computeScore({ company, investors, updates, readinessItems });
  const status = getStatus(score);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Subtle gradient strip at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${status.color}99, ${status.color})` }}
      />

      <div className="flex items-center gap-6 px-6 py-4">
        {/* Gauge + Score */}
        <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 80, height: 80 }}>
          <ArcGauge score={score} color={status.color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[22px] font-bold text-slate-900 leading-none">{score}</span>
          </div>
        </div>

        {/* Label + status */}
        <div className="flex-shrink-0 min-w-[120px]">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Raise Health</p>
          <p className="text-2xl font-bold text-slate-900 leading-none mb-2">{score}<span className="text-sm font-normal text-slate-400">/100</span></p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.bg} ${status.text}`}
            style={{ borderColor: `${status.color}33` }}>
            {status.label}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-14 bg-slate-100 flex-shrink-0" />

        {/* Insights */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Top Signals</p>
          <div className="space-y-1.5">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-sm flex-shrink-0 ${ins.positive ? "text-emerald-500" : "text-amber-500"}`}>
                  {ins.positive ? "✓" : "⚠"}
                </span>
                <button
                  onClick={() => scrollTo(ins.section)}
                  className="text-[12px] text-slate-600 hover:text-violet-600 text-left leading-tight transition-colors"
                >
                  {ins.text}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}