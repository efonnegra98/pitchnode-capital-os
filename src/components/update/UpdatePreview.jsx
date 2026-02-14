import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, FileDown } from "lucide-react";

export default function UpdatePreview({ data, companyName }) {
  const previewRef = useRef(null);

  const formatCurrency = (val) => {
    if (!val && val !== 0) return "N/A";
    return `$${Number(val).toLocaleString()}`;
  };

  const plainText = `
${companyName || "Company"} — Investor Update: ${data.month || ""}
${"=".repeat(50)}

FINANCIAL METRICS
• Revenue: ${formatCurrency(data.revenue)}
• Revenue Growth: ${data.revenue_growth ? data.revenue_growth + "%" : "N/A"}
• Burn Rate: ${formatCurrency(data.burn_rate)}
• Cash Balance: ${formatCurrency(data.cash_balance)}
• Runway: ${data.runway_months ? data.runway_months + " months" : "N/A"}

HIGHLIGHTS
${data.highlights || "—"}

PRODUCT UPDATES
${data.product_updates || "—"}

HIRING UPDATES
${data.hiring_updates || "—"}

KEY WINS
${data.key_wins || "—"}

ASKS
${data.asks || "—"}
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText);
  };

  const handleDownload = () => {
    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investor-update-${(data.month || "draft").replace(/\s/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Preview</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-white/40 hover:text-white hover:bg-white/[0.06]"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white/40 hover:text-white hover:bg-white/[0.06]"
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5" /> Download
          </Button>
        </div>
      </div>

      <div ref={previewRef} className="glass rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600/30 to-indigo-600/30 px-6 py-5 border-b border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300/60 mb-1">Investor Update</p>
          <h2 className="text-lg font-bold text-white">{data.month || "Draft"}</h2>
          <p className="text-xs text-white/40 mt-1">{companyName || "Your Company"}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Revenue", value: formatCurrency(data.revenue) },
              { label: "Growth", value: data.revenue_growth ? `${data.revenue_growth}%` : "N/A" },
              { label: "Burn Rate", value: formatCurrency(data.burn_rate) },
              { label: "Cash", value: formatCurrency(data.cash_balance) },
              { label: "Runway", value: data.runway_months ? `${data.runway_months} mo` : "N/A" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Sections */}
          {[
            { label: "Highlights", content: data.highlights },
            { label: "Product Updates", content: data.product_updates },
            { label: "Hiring Updates", content: data.hiring_updates },
            { label: "Key Wins", content: data.key_wins },
            { label: "Asks", content: data.asks },
          ].filter(s => s.content).map(({ label, content }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-violet-300/70 uppercase tracking-wider mb-2">{label}</p>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}