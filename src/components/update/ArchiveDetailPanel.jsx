import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileDown, Send, X, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCompany } from "../useCompany";

export default function ArchiveDetailPanel({ data, companyName, companyLogo, onClose }) {
  const panelRef = useRef(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const { companyId } = useCompany();

  const { data: investors = [] } = useQuery({
    queryKey: ["investors", companyId],
    queryFn: () => base44.entities.Investor.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const formatCurrency = (val) => {
    if (!val && val !== 0) return "—";
    return `$${Number(val).toLocaleString()}`;
  };

  const plainText = `
${companyName || "Company"} — Investor Update: ${data.month || ""}
${"=".repeat(50)}

FINANCIAL METRICS
• Revenue: ${formatCurrency(data.revenue)}
• Revenue Growth: ${data.revenue_growth ? data.revenue_growth + "%" : "—"}
• Burn Rate: ${formatCurrency(data.burn_rate)}
• Cash Balance: ${formatCurrency(data.cash_balance)}
• Runway: ${data.runway_months ? data.runway_months + " months" : "—"}

${data.highlights ? `HIGHLIGHTS\n${data.highlights}\n` : ""}
${data.product_updates ? `PRODUCT UPDATES\n${data.product_updates}\n` : ""}
${data.hiring_updates ? `HIRING UPDATES\n${data.hiring_updates}\n` : ""}
${data.key_wins ? `KEY WINS\n${data.key_wins}\n` : ""}
${data.asks ? `ASKS\n${data.asks}` : ""}
`.trim();

  const handleDownloadPDF = () => {
    // Build a printable HTML page and trigger a PDF via browser print dialog
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${companyName} — Investor Update ${data.month || ""}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; padding: 48px; max-width: 720px; margin: 0 auto; font-size: 14px; line-height: 1.6; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .subtitle { color: #7c3aed; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 24px; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
    .metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
    .metric-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
    .metric-value { font-size: 16px; font-weight: 600; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #7c3aed; font-weight: 700; margin-bottom: 8px; }
    .section-body { color: #334155; white-space: pre-wrap; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
  </style>
</head>
<body>
  <h1>${companyName || "Company"}</h1>
  <div class="subtitle">Investor Update</div>
  <div class="meta">
    <strong>${data.month || ""}</strong>
    ${data.sent_date ? ` · Sent ${new Date(data.sent_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : ""}
  </div>
  <div class="metrics">
    <div class="metric"><div class="metric-label">Revenue</div><div class="metric-value">${formatCurrency(data.revenue)}</div></div>
    <div class="metric"><div class="metric-label">Growth</div><div class="metric-value">${data.revenue_growth ? data.revenue_growth + "%" : "—"}</div></div>
    <div class="metric"><div class="metric-label">Burn Rate</div><div class="metric-value">${formatCurrency(data.burn_rate)}</div></div>
    <div class="metric"><div class="metric-label">Cash Balance</div><div class="metric-value">${formatCurrency(data.cash_balance)}</div></div>
    <div class="metric"><div class="metric-label">Runway</div><div class="metric-value">${data.runway_months ? data.runway_months + " mo" : "—"}</div></div>
  </div>
  ${data.highlights ? `<div class="section"><div class="section-title">Highlights</div><div class="section-body">${data.highlights}</div></div>` : ""}
  ${data.product_updates ? `<div class="section"><div class="section-title">Product Updates</div><div class="section-body">${data.product_updates}</div></div>` : ""}
  ${data.hiring_updates ? `<div class="section"><div class="section-title">Hiring Updates</div><div class="section-body">${data.hiring_updates}</div></div>` : ""}
  ${data.key_wins ? `<div class="section"><div class="section-title">Key Wins</div><div class="section-body">${data.key_wins}</div></div>` : ""}
  ${data.asks ? `<div class="section"><div class="section-title">Asks</div><div class="section-body">${data.asks}</div></div>` : ""}
  <div class="footer">Confidential — ${companyName || "Company"} Investor Update · ${data.month || ""}</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const handleResend = async () => {
    const investorsWithEmail = investors.filter((i) => i.email);
    if (investorsWithEmail.length === 0) {
      alert("No investors with email addresses found in your CRM.");
      return;
    }
    setResending(true);
    const subject = `Investor Update — ${data.month || ""} · ${companyName}`;
    for (const investor of investorsWithEmail) {
      await base44.integrations.Core.SendEmail({
        to: investor.email,
        subject,
        body: plainText,
      });
    }
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-violet-600 font-semibold">Sent Update</p>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">{data.month}</h2>
          {data.sent_date && (
            <p className="text-xs text-slate-500 mt-0.5">
              Sent {new Date(data.sent_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-1.5 border-slate-300">
            <FileDown className="w-3.5 h-3.5" /> Download PDF
          </Button>
          <Button
            size="sm"
            onClick={handleResend}
            disabled={resending || resent}
            className={`gap-1.5 ${resent ? "bg-emerald-600 hover:bg-emerald-600" : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"} text-white`}
          >
            {resent ? <><CheckCircle2 className="w-3.5 h-3.5" /> Sent!</> : resending ? "Sending..." : <><Send className="w-3.5 h-3.5" /> Resend to Investors</>}
          </Button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={panelRef} className="p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Revenue", value: formatCurrency(data.revenue) },
            { label: "Growth", value: data.revenue_growth ? `${data.revenue_growth}%` : "—" },
            { label: "Burn Rate", value: formatCurrency(data.burn_rate) },
            { label: "Cash", value: formatCurrency(data.cash_balance) },
            { label: "Runway", value: data.runway_months ? `${data.runway_months} mo` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-5">
          {[
            { label: "Highlights", content: data.highlights },
            { label: "Product Updates", content: data.product_updates },
            { label: "Hiring Updates", content: data.hiring_updates },
            { label: "Key Wins", content: data.key_wins },
            { label: "Asks", content: data.asks },
          ].filter((s) => s.content).map(({ label, content }) => (
            <div key={label}>
              <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wider mb-2">{label}</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}