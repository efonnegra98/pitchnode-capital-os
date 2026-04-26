import React, { useState, useRef, useCallback } from "react";
import { X, Upload, FileSpreadsheet, Download, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Expected columns in template
const TEMPLATE_HEADERS = ["Investor Name", "Firm/Organization", "Email", "Investor Type", "Stage Focus"];

// Auto-map CSV headers to entity fields
function mapHeader(h) {
  const lower = h.toLowerCase();
  if (lower.includes("name") && !lower.includes("firm") && !lower.includes("org")) return "name";
  if (lower.includes("firm") || lower.includes("organization") || lower.includes("company")) return "firm";
  if (lower.includes("email")) return "email";
  if (lower.includes("type") || lower.includes("investor type")) return "investor_type";
  if (lower.includes("stage")) return "stage_focus";
  return null;
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim());
  const rows = lines.slice(1).map(line => {
    const cols = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; continue; }
      if (line[i] === "," && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += line[i];
    }
    cols.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i] || ""; });
    return obj;
  }).filter(row => Object.values(row).some(v => v.trim()));
  return { headers, rows };
}

function buildRecord(row, headers) {
  const rec = {};
  headers.forEach(h => {
    const field = mapHeader(h);
    if (field && row[h]) rec[field] = row[h];
  });
  return rec;
}

function downloadTemplate() {
  const rows = [
    TEMPLATE_HEADERS.join(","),
    "Sarah Chen,Acme Ventures,sarah@acme.vc,Venture Capital,Seed",
    "James Okafor,FO Capital,,Family Office,Pre-Seed",
  ].join("\n");
  const blob = new Blob([rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "investor_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const INVESTOR_TYPE_VALUES = ["Angel", "Family Office", "Venture Capital", "Private Equity", "Strategic/Corporate", "Other"];
const STAGE_FOCUS_VALUES = ["Pre-Seed", "Seed", "Series A", "Series B+", "Growth"];

function sanitizeRecord(rec) {
  const out = { ...rec };
  if (out.investor_type && !INVESTOR_TYPE_VALUES.includes(out.investor_type)) out.investor_type = undefined;
  if (out.stage_focus && !STAGE_FOCUS_VALUES.includes(out.stage_focus)) out.stage_focus = undefined;
  return out;
}

export default function BulkUploadModal({ companyId, existingInvestors, onClose, onImported }) {
  const [step, setStep] = useState("upload"); // upload | preview | success
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const processFile = useCallback(async (file) => {
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCSV(text);
    if (!parsed.headers.length || !parsed.rows.length) {
      alert("Could not parse the file. Please check the format and try again.");
      return;
    }
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setStep("preview");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    setImporting(true);
    let count = 0;

    for (const row of rows) {
      const rec = buildRecord(row, headers);
      if (!rec.name?.trim() && !rec.firm?.trim()) continue;

      const isDup = existingInvestors.some(inv => {
        if (rec.email?.trim() && inv.email?.trim()) {
          return rec.email.trim().toLowerCase() === inv.email.trim().toLowerCase();
        }
        return (
          rec.name?.trim().toLowerCase() === inv.name?.trim().toLowerCase() &&
          rec.firm?.trim().toLowerCase() === inv.firm?.trim().toLowerCase() &&
          (rec.name?.trim() || rec.firm?.trim())
        );
      });
      if (isDup) continue;

      const sanitized = sanitizeRecord(rec);
      await base44.entities.Investor.create({ ...sanitized, company_id: companyId, funnel_stage: "Identified" });
      count++;
    }

    setImportedCount(count);
    setImporting(false);
    setStep("success");
    onImported();
  };

  const previewRows = rows.slice(0, 5);
  const previewHeaders = headers.filter(h => mapHeader(h));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Import Investor List</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* STEP: Upload */}
          {step === "upload" && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragging ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">Drag & drop your CSV here</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                <p className="text-[11px] text-slate-300 mt-3">Supports .csv files</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
              </div>

              {/* Column guide */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-2">Expected columns</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_HEADERS.map(h => (
                    <span key={h} className="text-[11px] font-mono bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded">{h}</span>
                  ))}
                </div>
              </div>

              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV Template
              </button>
            </div>
          )}

          {/* STEP: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{fileName}</span>
                  <span className="text-slate-400 ml-2">· {rows.length} rows detected</span>
                </p>
                <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-700">
                  <Download className="w-3 h-3" /> Template
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preview (first 5 rows)</p>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        {previewHeaders.map(h => (
                          <th key={h} className="text-left text-[11px] font-semibold text-slate-500 px-3 py-2 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRows.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {previewHeaders.map(h => (
                            <td key={h} className="px-3 py-2 text-slate-700 max-w-[140px] truncate">{row[h] || <span className="text-slate-300">—</span>}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 5 && (
                  <p className="text-[11px] text-slate-400 mt-1.5">+ {rows.length - 5} more rows not shown</p>
                )}
              </div>

              <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-xs text-violet-700">
                <strong>{rows.length}</strong> investors will be added to your pipeline. Duplicates will be skipped automatically.
              </div>
            </div>
          )}

          {/* STEP: Success */}
          {step === "success" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800">
                  {importedCount} investor{importedCount !== 1 ? "s" : ""} added to your pipeline
                </p>
                <p className="text-sm text-slate-400 mt-1">{fileName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {step === "success" ? (
            <div />
          ) : (
            <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
          )}

          <div className="flex gap-3">
            {step === "preview" && (
              <>
                <button
                  onClick={() => setStep("upload")}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-60"
                >
                  {importing ? "Importing…" : `Import ${rows.length} Investor${rows.length !== 1 ? "s" : ""}`}
                </button>
              </>
            )}
            {step === "success" && (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-all"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}