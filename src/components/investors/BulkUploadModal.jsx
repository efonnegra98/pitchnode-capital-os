import React, { useState, useRef, useCallback } from "react";
import { X, Upload, FileSpreadsheet, Download, ChevronRight, Check, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Field definitions for mapping
const INVESTOR_FIELDS = [
  { key: "name",              label: "Name" },
  { key: "firm",              label: "Company / Firm" },
  { key: "email",             label: "Email" },
  { key: "stage_focus",       label: "Stage Focus" },
  { key: "check_size",        label: "Check Size" },
  { key: "notes",             label: "Notes" },
  { key: "last_contact_date", label: "Last Contact Date" },
  { key: "contact_method",    label: "Contact Method" },
];

const TEMPLATE_HEADERS = ["Name", "Firm", "Email", "Stage", "Check Size", "Notes", "Last Contact Date", "Contact Method"];

// Parse CSV text into rows
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
  });
  return { headers, rows };
}

// Try to auto-match a column header to an investor field
function autoMatch(header) {
  const h = header.toLowerCase();
  if (h.includes("name") && !h.includes("firm") && !h.includes("company")) return "name";
  if (h.includes("firm") || h.includes("company") || h.includes("organization")) return "firm";
  if (h.includes("email")) return "email";
  if (h.includes("stage")) return "stage_focus";
  if (h.includes("check") || h.includes("size")) return "check_size";
  if (h.includes("note")) return "notes";
  if (h.includes("contact") && h.includes("date")) return "last_contact_date";
  if (h.includes("method") || h.includes("channel")) return "contact_method";
  return "";
}

function downloadTemplate() {
  const csv = TEMPLATE_HEADERS.join(",") + "\n" + "Sarah Chen,Acme Ventures,sarah@acme.vc,Seed,\"$100k-$500k\",Met at demo day,2024-11-01,Email";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "investor_list_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const STEPS = ["upload", "map", "confirm"];

export default function BulkUploadModal({ companyId, existingInvestors, onClose, onImported }) {
  const [step, setStep] = useState("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({}); // colHeader -> investorField key
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null); // { imported, skippedInvalid, skippedDuplicate }
  const fileRef = useRef();

  const processFile = useCallback(async (file) => {
    setFileName(file.name);
    let text;
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      // Use base44 extraction for Excel
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            rows: {
              type: "array",
              items: { type: "object", additionalProperties: { type: "string" } }
            }
          }
        }
      });
      if (res.status !== "success" || !res.output?.rows?.length) {
        alert("Could not read the Excel file. Please try a CSV.");
        return;
      }
      const hdrs = Object.keys(res.output.rows[0]);
      setHeaders(hdrs);
      setRows(res.output.rows);
      const autoMap = {};
      hdrs.forEach(h => { const m = autoMatch(h); if (m) autoMap[h] = m; });
      setMapping(autoMap);
      setStep("map");
      return;
    }
    // CSV
    text = await file.text();
    const parsed = parseCSV(text);
    if (!parsed.headers.length) { alert("Could not parse the file."); return; }
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    const autoMap = {};
    parsed.headers.forEach(h => { const m = autoMatch(h); if (m) autoMap[h] = m; });
    setMapping(autoMap);
    setStep("map");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  // Build preview of what will be imported
  const buildRecords = () => {
    return rows.map(row => {
      const rec = {};
      Object.entries(mapping).forEach(([col, field]) => {
        if (field && row[col] !== undefined) rec[field] = row[col];
      });
      return rec;
    });
  };

  const handleImport = async () => {
    setImporting(true);
    const records = buildRecords();

    let importedCount = 0;
    let skippedInvalid = 0;
    let skippedDuplicate = 0;

    for (const rec of records) {
      const hasName = rec.name?.trim();
      const hasFirm = rec.firm?.trim();
      if (!hasName && !hasFirm) { skippedInvalid++; continue; }

      // Duplicate check
      const isDup = existingInvestors.some(inv => {
        if (rec.email?.trim() && inv.email?.trim()) {
          return rec.email.trim().toLowerCase() === inv.email.trim().toLowerCase();
        }
        const nameMatch = rec.name?.trim().toLowerCase() === inv.name?.trim().toLowerCase();
        const firmMatch = rec.firm?.trim().toLowerCase() === inv.firm?.trim().toLowerCase();
        return nameMatch && firmMatch && (rec.name?.trim() || rec.firm?.trim());
      });
      if (isDup) { skippedDuplicate++; continue; }

      await base44.entities.Investor.create({ ...rec, company_id: companyId });
      importedCount++;
    }

    setResult({ imported: importedCount, skippedInvalid, skippedDuplicate, total: records.length });
    setImporting(false);
    setStep("confirm");
    onImported();
  };

  const statsPreview = () => {
    const records = buildRecords();
    const valid = records.filter(r => r.name?.trim() || r.firm?.trim());
    return { total: records.length, valid: valid.length, invalid: records.length - valid.length };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Upload Investor List</h2>
            <div className="flex items-center gap-2 mt-1">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <span className={`text-[11px] font-medium capitalize ${step === s ? "text-violet-600" : "text-slate-300"}`}>
                    {s === "upload" ? "Upload" : s === "map" ? "Map Columns" : "Import"}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-slate-200" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* STEP: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
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
                <p className="text-sm font-medium text-slate-600">Drag & drop your file here</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                <p className="text-[11px] text-slate-300 mt-3">Supports .csv and .xlsx</p>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
              </div>

              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-700 transition-colors mx-auto"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV Template
              </button>
            </div>
          )}

          {/* STEP: Map Columns */}
          {step === "map" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">{fileName}</span> — {rows.length} rows found
                </p>
                <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-700">
                  <Download className="w-3 h-3" /> Template
                </button>
              </div>

              <p className="text-xs text-slate-400">Map your file's columns to investor fields. Skip any that don't apply.</p>

              <div className="space-y-2">
                {headers.map(col => (
                  <div key={col} className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded w-44 truncate flex-shrink-0">{col}</span>
                    <span className="text-slate-300 text-xs">→</span>
                    <select
                      value={mapping[col] || ""}
                      onChange={e => setMapping(m => ({ ...m, [col]: e.target.value }))}
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:border-violet-400"
                    >
                      <option value="">— Skip —</option>
                      {INVESTOR_FIELDS.map(f => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {(() => {
                const { total, valid, invalid } = statsPreview();
                return (
                  <div className="mt-4 bg-slate-50 rounded-lg px-4 py-3 text-xs text-slate-500 flex gap-4">
                    <span>{total} rows</span>
                    <span className="text-emerald-600 font-medium">✓ {valid} valid</span>
                    {invalid > 0 && <span className="text-amber-600">⚠ {invalid} will be skipped (no name or firm)</span>}
                  </div>
                );
              })()}
            </div>
          )}

          {/* STEP: Confirm / Result */}
          {step === "confirm" && result && (
            <div className="text-center py-6 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800">Import Complete</p>
                <p className="text-sm text-slate-500 mt-1">{fileName}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{result.total}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Rows Found</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-emerald-700">{result.imported}</p>
                  <p className="text-[11px] text-emerald-500 mt-1">Imported</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-amber-700">{result.skippedInvalid + result.skippedDuplicate}</p>
                  <p className="text-[11px] text-amber-500 mt-1">Skipped</p>
                </div>
              </div>
              {(result.skippedInvalid > 0 || result.skippedDuplicate > 0) && (
                <div className="text-xs text-slate-400 space-y-0.5">
                  {result.skippedInvalid > 0 && <p>{result.skippedInvalid} row{result.skippedInvalid !== 1 ? "s" : ""} missing name and firm</p>}
                  {result.skippedDuplicate > 0 && <p>{result.skippedDuplicate} duplicate{result.skippedDuplicate !== 1 ? "s" : ""} skipped</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            {step === "confirm" ? "Close" : "Cancel"}
          </button>
          {step === "map" && (
            <div className="flex gap-3">
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
                {importing ? "Importing…" : `Import Investors`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}