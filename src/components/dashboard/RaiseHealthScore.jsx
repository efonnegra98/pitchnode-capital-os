import React, { useEffect, useRef, useState } from "react";

// ── Scoring Engine ──────────────────────────────────────────────────────────
function computeScore({ company, investors, updates, readinessItems, activities = [] }) {
  let score = 0;
  const incomplete = []; // { text, points, section }

  // 1. COMPANY PROFILE (15 pts)
  if (company?.name) score += 5;
  else incomplete.push({ text: "Add your company name", points: 5, section: "round-overview" });

  if (company?.target_raise_amount > 0) score += 5;
  else incomplete.push({ text: "Set your raise target — worth 5 pts", points: 5, section: "round-overview" });

  if (company?.round_type) score += 5;
  else incomplete.push({ text: "Select your funding stage (Pre-Seed, Seed, etc.) — worth 5 pts", points: 5, section: "round-overview" });

  // 2. INVESTOR PIPELINE (25 pts)
  const invCount = investors.length;
  if (invCount >= 10) score += 20;
  else if (invCount >= 5) score += 15;
  else if (invCount >= 1) score += 8;
  else incomplete.push({ text: "Add investors to your pipeline — worth up to 20 pts", points: 20, section: "funnel-analytics" });

  if (invCount > 0 && invCount < 5) incomplete.push({ text: `Add ${5 - invCount} more investor${5 - invCount !== 1 ? "s" : ""} to reach 5 — worth +7 pts`, points: 7, section: "funnel-analytics" });
  if (invCount >= 5 && invCount < 10) incomplete.push({ text: `Add ${10 - invCount} more investor${10 - invCount !== 1 ? "s" : ""} to reach 10 — worth +5 pts`, points: 5, section: "funnel-analytics" });

  const advancedStages = ["Intro Call Scheduled", "Intro Call Complete", "Interest Confirmed", "Diligence", "Term Sheet", "Closed Won"];
  const hasAdvanced = investors.some(i => advancedStages.includes(i.funnel_stage));
  if (hasAdvanced) score += 5;
  else if (invCount > 0) incomplete.push({ text: "Move an investor to Intro Call stage — worth 5 pts", points: 5, section: "funnel-analytics" });

  // 3. DATA ROOM READINESS (20 pts)
  const totalItems = readinessItems.length;
  const completeItems = readinessItems.filter(i => i.status === "Complete").length;
  const hasUpload = readinessItems.some(i => i.file_url);
  const readinessPct = totalItems > 0 ? Math.round((completeItems / totalItems) * 100) : 0;

  if (readinessPct >= 80) score += 20;
  else if (readinessPct >= 50) score += 10;
  else if (hasUpload) score += 5;

  if (!hasUpload) incomplete.push({ text: "Upload your pitch deck to the data room — worth up to 20 pts", points: 20, section: "raise-readiness" });
  else if (readinessPct < 50) incomplete.push({ text: `Complete 50%+ of your data room checklist — worth +10 pts (currently ${readinessPct}%)`, points: 10, section: "raise-readiness" });
  else if (readinessPct < 80) incomplete.push({ text: `Push your data room to 80%+ — worth +10 pts (currently ${readinessPct}%)`, points: 10, section: "raise-readiness" });

  // 4. INVESTOR UPDATES (15 pts)
  const sentUpdates = updates.filter(u => u.status === "sent");
  const hasSent = sentUpdates.length > 0;
  if (hasSent) {
    score += 10;
    const mostRecent = sentUpdates.reduce((a, b) => new Date(b.sent_date) > new Date(a.sent_date) ? b : a);
    const daysSince = mostRecent.sent_date
      ? Math.floor((new Date() - new Date(mostRecent.sent_date)) / (1000 * 60 * 60 * 24))
      : 999;
    if (daysSince <= 30) score += 5;
    else incomplete.push({ text: "Send an investor update this month — worth 5 pts", points: 5, section: "financial-metrics" });
  } else {
    incomplete.push({ text: "Send your first investor update — worth 10 pts", points: 10, section: "financial-metrics" });
  }

  // 5. FINANCIAL METRICS (15 pts)
  const latestUpdate = updates.length > 0
    ? updates.reduce((a, b) => new Date(b.updated_date) > new Date(a.updated_date) ? b : a)
    : null;
  const hasMRR = latestUpdate?.revenue > 0;
  const hasBurn = latestUpdate?.burn_rate > 0;
  const hasCash = latestUpdate?.cash_balance > 0;

  if (hasMRR) score += 5;
  else incomplete.push({ text: "Enter your MRR in an investor update — worth 5 pts", points: 5, section: "financial-metrics" });

  if (hasBurn) score += 5;
  else incomplete.push({ text: "Log your burn rate — worth 5 pts", points: 5, section: "financial-metrics" });

  if (hasCash) score += 5;
  else incomplete.push({ text: "Enter your cash on hand — worth 5 pts", points: 5, section: "financial-metrics" });

  // 6. ROUND ACTIVITY (10 pts)
  const hasActivity = activities.length > 0;
  if (hasActivity) {
    score += 5;
    const recentActivity = activities.some(a => {
      const days = Math.floor((new Date() - new Date(a.date || a.created_date)) / (1000 * 60 * 60 * 24));
      return days <= 7;
    });
    if (recentActivity) score += 5;
    else incomplete.push({ text: "Log a CRM activity this week — worth 5 pts", points: 5, section: "action-required" });
  } else {
    incomplete.push({ text: "Log your first investor interaction in the CRM — worth 5 pts", points: 5, section: "action-required" });
  }

  // Sort incomplete by highest impact first, take top 3
  incomplete.sort((a, b) => b.points - a.points);
  const topSignals = incomplete.slice(0, 3);

  return { score: Math.min(score, 100), topSignals };
}

// ── Status Labels ───────────────────────────────────────────────────────────
function getStatus(score) {
  if (score >= 95) return { label: "Raise Ready", subtitle: "You are running an institutional-grade raise", color: "#059669", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400" };
  if (score >= 85) return { label: "On Track", subtitle: "Strong raise in progress", color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400" };
  if (score >= 70) return { label: "Good Progress", subtitle: "Your raise is gaining traction", color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400" };
  if (score >= 50) return { label: "Needs Work", subtitle: "Good progress — keep building momentum", color: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400" };
  if (score >= 30) return { label: "At Risk", subtitle: "Key gaps are slowing your raise", color: "#f97316", bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-400" };
  return { label: "Critical", subtitle: "Your raise needs immediate attention", color: "#ef4444", bg: "bg-red-50 dark:bg-red-950/50", text: "text-red-700 dark:text-red-400" };
}

// ── SVG Arc Gauge ───────────────────────────────────────────────────────────
function ArcGauge({ score, color }) {
  const size = 84;
  const strokeWidth = 7;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 210;
  const totalDeg = 300;
  const fillDeg = (score / 100) * totalDeg;
  const trackEnd = startAngle + totalDeg;
  const fillEnd = startAngle + fillDeg;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPath = (from, to) => {
    const s = { x: cx + r * Math.cos(toRad(from)), y: cy + r * Math.sin(toRad(from)) };
    const e = { x: cx + r * Math.cos(toRad(to)), y: cy + r * Math.sin(toRad(to)) };
    const large = to - from > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={arcPath(startAngle, trackEnd)} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} strokeLinecap="round" />
      {score > 0 && (
        <path
          d={arcPath(startAngle, fillEnd)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      )}
    </svg>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function RaiseHealthScore({ company, investors, updates, readinessItems, activities = [] }) {
  const { score, topSignals } = computeScore({ company, investors, updates, readinessItems, activities });
  const status = getStatus(score);

  const prevScoreRef = useRef(score);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (score > prevScoreRef.current) {
      setBump(true);
      setTimeout(() => setBump(false), 600);
    }
    prevScoreRef.current = score;
  }, [score]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Color strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${status.color}66, ${status.color})` }} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 px-6 py-5">
        {/* Gauge + Score */}
        <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 84, height: 84 }}>
          <ArcGauge score={score} color={status.color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-[22px] font-bold text-foreground leading-none transition-transform ${bump ? "scale-125" : "scale-100"}`}
              style={{ transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            >
              {score}
            </span>
          </div>
        </div>

        {/* Label */}
        <div className="flex-shrink-0 min-w-[130px]">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Raise Health Score</p>
          <p className="text-2xl font-bold text-foreground leading-none mb-2">
            {score}<span className="text-sm font-normal text-muted-foreground">/100</span>
          </p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.bg} ${status.text}`}
            style={{ borderColor: `${status.color}33` }}
          >
            {status.label}
          </span>
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-tight max-w-[140px]">{status.subtitle}</p>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-16 bg-border flex-shrink-0" />

        {/* Top Signals — coaching prompts */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
            {topSignals.length > 0 ? "Highest-Impact Next Steps" : "All Systems Go"}
          </p>
          {topSignals.length === 0 ? (
            <p className="text-sm text-emerald-600 font-medium">🎉 Your raise is firing on all cylinders.</p>
          ) : (
            <div className="space-y-2">
              {topSignals.map((sig, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(sig.section)}
                  className="flex items-start gap-2 text-left w-full group"
                >
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-[9px] font-bold text-amber-600 dark:text-amber-400">
                    {i + 1}
                  </span>
                  <span className="text-[12px] text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-tight">
                    {sig.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}