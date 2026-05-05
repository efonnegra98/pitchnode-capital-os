import React from "react";
import { X } from "lucide-react";

function buildEmailHtml({ form, companyName, founderName, companyLogo }) {
  const fmtCurrency = (v) => v ? (v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v.toLocaleString()}`) : null;

  const financial = [
    form.revenue && `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">MRR</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#1e293b;font-size:13px;">${fmtCurrency(form.revenue)}</td></tr>`,
    form.revenue_growth ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">MoM Growth</td><td style="padding:6px 0;text-align:right;font-weight:600;color:${form.revenue_growth > 0 ? '#10b981' : '#ef4444'};font-size:13px;">${form.revenue_growth > 0 ? '+' : ''}${form.revenue_growth}%</td></tr>` : null,
    form.burn_rate && `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Burn Rate</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#1e293b;font-size:13px;">${fmtCurrency(form.burn_rate)}/mo</td></tr>`,
    form.runway_months && `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Runway</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#1e293b;font-size:13px;">${form.runway_months} months</td></tr>`,
    form.cash_balance && `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Cash</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#1e293b;font-size:13px;">${fmtCurrency(form.cash_balance)}</td></tr>`,
  ].filter(Boolean).join("");

  const section = (title, content) => content ? `
    <tr><td colspan="2" style="padding:20px 0 8px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7c3aed;margin-bottom:8px;">${title}</div>
      <div style="font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap;">${content}</div>
    </td></tr>` : "";

  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:linear-gradient(135deg,#6d5df6,#4f46e5);padding:32px 36px;">
        ${companyLogo ? `<img src="${companyLogo}" style="height:32px;margin-bottom:12px;display:block;" />` : ""}
        <div style="font-size:20px;font-weight:700;color:#fff;">${form.subject_line || `${form.month} Investor Update`}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px;">From ${founderName || "the Founder"} · ${companyName}</div>
      </div>
      <div style="padding:32px 36px;">
        <table style="width:100%;border-collapse:collapse;">
          ${financial ? `<tr><td colspan="2" style="padding-bottom:16px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7c3aed;margin-bottom:12px;">Financial Snapshot</div>
            <table style="width:100%;border-top:1px solid #f1f5f9;">${financial}</table>
          </td></tr>` : ""}
          ${section("Headline Summary", form.highlights)}
          ${section("Key Wins", form.key_wins)}
          ${section("Product Updates", form.product_updates)}
          ${section("Hiring & Team", form.hiring_updates)}
          ${section("Challenges", form.challenges)}
          ${section("Ask", form.asks)}
        </table>
      </div>
      <div style="padding:20px 36px;border-top:1px solid #f1f5f9;background:#f8fafc;text-align:center;">
        <p style="font-size:11px;color:#94a3b8;margin:0;">Sent via Capital OS · <a href="#" style="color:#7c3aed;text-decoration:none;">Unsubscribe</a></p>
      </div>
    </div>
  `;
}

export default function EmailPreviewModal({ form, companyName, founderName, companyLogo, onClose }) {
  const html = buildEmailHtml({ form, companyName, founderName, companyLogo });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Email Preview</h2>
            <p className="text-xs text-slate-400">This is what investors will receive</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 bg-slate-50">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}