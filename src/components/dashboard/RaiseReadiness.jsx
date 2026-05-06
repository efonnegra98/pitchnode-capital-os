import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle2, Circle, Clock, FileText, Upload, File, X,
  Send, Share2, Info, CheckCircle, AlertTriangle, Zap, Plus
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompany } from "../useCompany";
import SendToInvestorModal from "../dataroom/SendToInvestorModal";
import InvestorViewFeed from "../dataroom/InvestorViewFeed";
import DocumentInsights from "../dataroom/DocumentInsights";
import MultiShareLinksModal from "../dataroom/MultiShareLinksModal";

const DEFAULT_ITEMS = [
  { item_name: "Pitch Deck", order: 1 },
  { item_name: "Financial Model", order: 2 },
  { item_name: "Capitalization Table", order: 3 },
  { item_name: "Key Metrics & KPIs", order: 4 },
  { item_name: "Corporate & Legal Documents", order: 5 },
  { item_name: "Customer References & Testimonials", order: 6 },
  { item_name: "Use of Funds", order: 7 },
];

const statusIcons = {
  "Not Started": Circle,
  "In Progress": Clock,
  "Complete": CheckCircle2,
};

const statusColors = {
  "Not Started": "text-slate-400",
  "In Progress": "text-amber-600",
  "Complete": "text-emerald-600",
};

// Smart readiness hints per document (feature 3)
const READINESS_HINTS = {
  "Pitch Deck": "Required by 95% of investors before taking a meeting.",
  "Financial Model": "73% of investors request this during diligence.",
  "Capitalization Table": "Investors need this before issuing a term sheet.",
  "Key Metrics & KPIs": "Demonstrates traction — top signal for institutional investors.",
  "Corporate & Legal Documents": "Required for legal due diligence before closing.",
  "Customer References & Testimonials": "Builds credibility and de-risks the investment decision.",
  "Use of Funds": "Every investor wants to know how their capital will be deployed.",
};

// Feature 6: staleness warning threshold
const STALE_DAYS = 90;

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function fmtDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Feature 4: Investor-Ready Badge
function ReadinessBadge({ score }) {
  if (score >= 90) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700 mb-5">
        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Investor Ready</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-500">Your data room is ready to share with investors.</p>
        </div>
      </div>
    );
  }
  if (score >= 50) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-700 mb-5">
        <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Getting There</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-500">Complete more items to make your data room investor-ready.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 mb-5">
      <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
      <div>
        <p className="text-sm font-bold text-red-700 dark:text-red-400">Not Ready for Investors</p>
        <p className="text-[11px] text-red-600 dark:text-red-500">Build out your data room before sharing with investors.</p>
      </div>
    </div>
  );
}

// Feature 3: hint tooltip
function HintTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-slate-300 hover:text-violet-400 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed pointer-events-none whitespace-normal text-center">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

export default function RaiseReadiness() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { companyId, company } = useCompany();
  const { toast } = useToast();

  // Feature 7: quick upload state (item id being uploaded inline)
  const [quickUploadId, setQuickUploadId] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["raise-readiness", companyId],
    queryFn: async () => {
      const existing = await base44.entities.RaiseReadinessItem.filter({ company_id: companyId });
      if (existing.length === 0) {
        const toCreate = DEFAULT_ITEMS.map(item => ({ ...item, company_id: companyId }));
        await base44.entities.RaiseReadinessItem.bulkCreate(toCreate);
        return await base44.entities.RaiseReadinessItem.filter({ company_id: companyId });
      }
      return existing;
    },
    enabled: !!companyId,
  });

  const { data: investors = [] } = useQuery({
    queryKey: ["investors", companyId],
    queryFn: () => base44.entities.Investor.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const { data: shares = [] } = useQuery({
    queryKey: ["dataroom-shares", companyId],
    queryFn: () => base44.entities.DataRoomShare.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RaiseReadinessItem.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["raise-readiness", companyId] }),
  });

  const createShareMutation = useMutation({
    mutationFn: (data) => base44.entities.DataRoomShare.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dataroom-shares", companyId] }),
  });

  const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  const completeCount = items.filter(i => i.status === "Complete").length;
  const readinessScore = items.length > 0 ? Math.round((completeCount / items.length) * 100) : 0;

  const handleStatusChange = (item, newStatus) => {
    updateMutation.mutate({ id: item.id, data: { status: newStatus } });
  };

  const handleNotesChange = (item, notes) => {
    updateMutation.mutate({ id: item.id, data: { notes } });
  };

  const handleFileUpload = async (item, file) => {
    if (!file) return;
    setQuickUploadId(item.id);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateMutation.mutate({
      id: item.id,
      data: { file_url, file_name: file.name, file_uploaded_date: new Date().toISOString(), status: "Complete" },
    });
    setQuickUploadId(null);
  };

  const handleFileRemove = (item) => {
    updateMutation.mutate({ id: item.id, data: { file_url: null, file_name: null, file_uploaded_date: null } });
  };

  const handleSendToInvestors = async (selectedInvestors, message) => {
    setIsSending(true);
    const companyName = company?.name || "Us";
    const subject = `Data Room Access — ${companyName}`;
    const now = new Date().toISOString();
    // Use the first active full_room share or create a new one
    const existingShare = shares.find(s => s.share_type === "full_room" && s.is_active !== false && !s.investor_id);
    const shareId = existingShare?.share_id || (() => { const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36); return id; })();
    const fullShareUrl = `${window.location.origin}/dataroom/${shareId}`;

    for (const investor of selectedInvestors) {
      const investorLabel = investor.name || investor.firm || "Investor";
      const personalizedMessage = message.replace("[Investor Name]", investor.name || investor.firm || "there");
      if (investor.email) {
        await base44.integrations.Core.SendEmail({ to: investor.email, subject, body: personalizedMessage });
      }
      await createShareMutation.mutateAsync({
        company_id: companyId,
        share_id: shareId,
        investor_id: investor.id,
        investor_name: investorLabel,
        investor_email: investor.email || "",
        firm_name: investor.firm || "",
        share_type: "full_room",
        sent_date: now,
        opened: false,
        message_sent: !!investor.email,
        label: `Sent to ${investorLabel}`,
      });
      toast({ title: `Data room sent to ${investorLabel}`, description: investor.email ? `Email delivered to ${investor.email}` : "Logged (no email on file)" });
    }
    setIsSending(false);
    setShowSendModal(false);
    queryClient.invalidateQueries({ queryKey: ["dataroom-shares", companyId] });
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded mb-4" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      {showShareModal && (
        <MultiShareLinksModal companyId={companyId} shares={shares} onClose={() => setShowShareModal(false)} />
      )}
      {showSendModal && (
        <SendToInvestorModal
          investors={investors}
          shareUrl={`${window.location.origin}/dataroom/general`}
          onSend={handleSendToInvestors}
          onClose={() => setShowSendModal(false)}
          isSending={isSending}
        />
      )}

      <div className="glass dark:bg-[#1a1a1a] rounded-xl p-6 border border-slate-200 dark:border-[#2a2a2a]">
        {/* ── Feature 4: Readiness Badge ── */}
        <ReadinessBadge score={readinessScore} />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-600 dark:text-[#888888] uppercase tracking-wider">Raise Readiness & Data Room</h2>
            <p className="text-slate-400 dark:text-[#888888] text-xs mt-1">Institutional preparedness checklist</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="text-right mr-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#888888] mb-1">Readiness Score</p>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 transition-all duration-500" style={{ width: `${readinessScore}%` }} />
                </div>
                <span className="text-2xl font-bold text-violet-600 dark:text-white">{readinessScore}%</span>
              </div>
            </div>
            <button
              onClick={() => setShowSendModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Send to Investor
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-violet-700 dark:text-violet-400 border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/20 hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Links
            </button>
          </div>
        </div>

        {/* ── Checklist ── */}
        <div className="space-y-2">
          {sortedItems.map((item) => {
            const StatusIcon = statusIcons[item.status || "Not Started"];
            const isExpanded = expandedId === item.id;
            const isComplete = item.status === "Complete";
            const isMissing = !isComplete;
            const hint = READINESS_HINTS[item.item_name];

            // Feature 6: last updated / stale
            const uploadDate = item.file_uploaded_date || item.updated_date;
            const daysOld = daysSince(uploadDate);
            const isStale = daysOld !== null && daysOld >= STALE_DAYS;
            const isUploading = quickUploadId === item.id;

            return (
              <div key={item.id} className="rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  {/* Status toggle */}
                  <button
                    onClick={() => handleStatusChange(item,
                      item.status === "Not Started" ? "In Progress" : item.status === "In Progress" ? "Complete" : "Not Started"
                    )}
                    className="flex-shrink-0 transition-colors"
                  >
                    <StatusIcon className={`w-5 h-5 ${statusColors[item.status || "Not Started"]}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm text-slate-800 dark:text-white font-medium">{item.item_name}</p>
                      {isMissing && hint && <HintTooltip text={hint} />}
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                      <span className={`text-[10px] uppercase tracking-wider font-medium ${statusColors[item.status || "Not Started"]}`}>
                        {item.status || "Not Started"}
                      </span>
                      {item.file_name && (
                        <span className="text-[10px] text-violet-600 dark:text-violet-400 flex items-center gap-1">
                          <File className="w-3 h-3" />{item.file_name}
                        </span>
                      )}
                      {uploadDate && !isStale && (
                        <span className="text-[10px] text-slate-400 dark:text-[#888888]">Updated {fmtDate(uploadDate)}</span>
                      )}
                      {isStale && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Consider updating — uploaded {Math.floor(daysOld / 30)} months ago
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick upload button */}
                  {!item.file_url && (
                    <label className="flex-shrink-0 cursor-pointer" title="Quick upload">
                      {isUploading ? (
                        <div className="w-7 h-7 rounded-md border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-md border border-slate-200 dark:border-[#2a2a2a] hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 flex items-center justify-center transition-colors text-slate-400 dark:text-[#888888] hover:text-violet-600">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.zip"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(item, f); e.target.value = ""; }}
                      />
                    </label>
                  )}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex-shrink-0 text-slate-400 dark:text-[#888888] hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-slate-100 dark:border-[#2a2a2a] pt-3 bg-slate-50/50 dark:bg-[#111111]">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#888888] mb-2 block">Document Upload</label>
                      {item.file_url ? (
                        <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-lg">
                          <File className="w-4 h-4 text-violet-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-800 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 font-medium block truncate">
                              {item.file_name}
                            </a>
                            {item.file_uploaded_date && (
                              <p className="text-[10px] text-slate-400 dark:text-[#888888]">
                                Uploaded {new Date(item.file_uploaded_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            )}
                          </div>
                          <button onClick={() => handleFileRemove(item)} className="text-slate-400 dark:text-[#888888] hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-[#2a2a2a] rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-all">
                          <Upload className="w-4 h-4 text-slate-400 dark:text-[#888888]" />
                          <span className="text-sm text-slate-600 dark:text-[#888888]">Upload file</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.zip"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(item, f); e.target.value = ""; }}
                          />
                        </label>
                      )}
                      <p className="text-[9px] text-slate-400 dark:text-[#888888] mt-1.5">Accepted: PDF, Excel, CSV, Word, ZIP</p>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#888888] mb-1.5 block">Status</label>
                      <Select value={item.status || "Not Started"} onValueChange={(v) => handleStatusChange(item, v)}>
                        <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Not Started", "In Progress", "Complete"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#888888] mb-1.5 block">Notes</label>
                      <Textarea
                        value={item.notes || ""}
                        onChange={e => handleNotesChange(item, e.target.value)}
                        onBlur={e => handleNotesChange(item, e.target.value)}
                        className="text-sm min-h-[60px]"
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Feature 2: Document Insights ── */}
        <DocumentInsights items={sortedItems} shares={shares} />

        {/* ── Feature 1: Live Investor View Feed ── */}
        <InvestorViewFeed shares={shares} />
      </div>
    </>
  );
}