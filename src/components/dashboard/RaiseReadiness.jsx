import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Circle, Clock, FileText, Upload, File, X, Link2, Send, Share2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompany } from "../useCompany";
import ShareDataRoomModal from "../dataroom/ShareDataRoomModal";
import SendToInvestorModal from "../dataroom/SendToInvestorModal";
import DataRoomActivity from "../dataroom/DataRoomActivity";

const DEFAULT_ITEMS = [
  { item_name: "Pitch Deck Finalized", order: 1 },
  { item_name: "Financial Model Updated", order: 2 },
  { item_name: "Cap Table Clean", order: 3 },
  { item_name: "KPI Dashboard Updated", order: 4 },
  { item_name: "Legal Structure Verified", order: 5 },
  { item_name: "Data Room Organized", order: 6 },
  { item_name: "Customer References Ready", order: 7 },
  { item_name: "Use of Funds Breakdown Prepared", order: 8 },
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

function generateShareId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export default function RaiseReadiness() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [docShareUrl, setDocShareUrl] = useState(null); // for per-document share modal
  const { companyId } = useCompany();

  // Persistent share ID per company (stored in localStorage)
  const shareIdKey = `dataroom_share_id_${companyId}`;
  const getOrCreateShareId = () => {
    let id = localStorage.getItem(shareIdKey);
    if (!id) {
      id = generateShareId();
      localStorage.setItem(shareIdKey, id);
    }
    return id;
  };

  const shareId = companyId ? getOrCreateShareId() : null;
  const fullShareUrl = shareId ? `https://capitalos.us/dataroom/${shareId}` : "";

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["raise-readiness", companyId],
    queryFn: async () => {
      const existing = await base44.entities.RaiseReadinessItem.filter({ company_id: companyId });
      if (existing.length === 0) {
        const itemsWithCompanyId = DEFAULT_ITEMS.map(item => ({ ...item, company_id: companyId }));
        await base44.entities.RaiseReadinessItem.bulkCreate(itemsWithCompanyId);
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
  const completeCount = items.filter((i) => i.status === "Complete").length;
  const readinessScore = items.length > 0 ? Math.round((completeCount / items.length) * 100) : 0;

  const handleStatusChange = (item, newStatus) => {
    updateMutation.mutate({ id: item.id, data: { status: newStatus } });
  };

  const handleNotesChange = (item, notes) => {
    updateMutation.mutate({ id: item.id, data: { notes } });
  };

  const handleFileUpload = async (item, file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateMutation.mutate({
      id: item.id,
      data: { file_url, file_name: file.name, file_uploaded_date: new Date().toISOString(), status: "Complete" },
    });
  };

  const handleFileRemove = (item) => {
    updateMutation.mutate({ id: item.id, data: { file_url: null, file_name: null, file_uploaded_date: null } });
  };

  const handleDocumentShare = (item) => {
    const docShareId = `${shareId}-doc-${item.id.slice(-6)}`;
    const url = `https://capitalos.us/dataroom/${shareId}/doc/${docShareId}`;
    setDocShareUrl(url);
    // Log document share
    createShareMutation.mutate({
      company_id: companyId,
      share_id: docShareId,
      share_type: "document",
      document_item_id: item.id,
      document_name: item.item_name,
      sent_date: new Date().toISOString(),
    });
  };

  const handleSendToInvestors = async (selectedInvestors, message) => {
    setIsSending(true);
    for (const investor of selectedInvestors) {
      const personalizedMessage = message.replace("[Investor Name]", investor.name || investor.firm || "there");
      // Send email
      if (investor.email) {
        await base44.integrations.Core.SendEmail({
          to: investor.email,
          subject: "Data Room Access",
          body: personalizedMessage,
        });
      }
      // Log the share
      await createShareMutation.mutateAsync({
        company_id: companyId,
        share_id: shareId,
        investor_id: investor.id,
        investor_name: investor.name || investor.firm || "Investor",
        investor_email: investor.email || "",
        share_type: "full_room",
        sent_date: new Date().toISOString(),
        message_sent: !!investor.email,
      });
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
        <ShareDataRoomModal shareUrl={fullShareUrl} onClose={() => setShowShareModal(false)} />
      )}
      {docShareUrl && (
        <ShareDataRoomModal shareUrl={docShareUrl} onClose={() => setDocShareUrl(null)} />
      )}
      {showSendModal && (
        <SendToInvestorModal
          investors={investors}
          shareUrl={fullShareUrl}
          onSend={handleSendToInvestors}
          onClose={() => setShowSendModal(false)}
          isSending={isSending}
        />
      )}

      <div className="glass rounded-xl p-6 border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              Raise Readiness & Data Room
            </h2>
            <p className="text-slate-400 text-xs mt-1">Institutional preparedness checklist</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Readiness Score</p>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 transition-all duration-500"
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
                <span className="text-2xl font-bold text-violet-600">{readinessScore}%</span>
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-violet-700 border border-violet-300 bg-violet-50 hover:bg-violet-100 transition-all"
            >
              <Link2 className="w-3.5 h-3.5" /> Share Data Room
            </button>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {sortedItems.map((item) => {
            const StatusIcon = statusIcons[item.status || "Not Started"];
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <button
                    onClick={() =>
                      handleStatusChange(
                        item,
                        item.status === "Not Started" ? "In Progress" : item.status === "In Progress" ? "Complete" : "Not Started"
                      )
                    }
                    className="flex-shrink-0 transition-colors"
                  >
                    <StatusIcon className={`w-5 h-5 ${statusColors[item.status || "Not Started"]}`} />
                  </button>

                  <div className="flex-1">
                    <p className="text-sm text-slate-800 font-medium">{item.item_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] uppercase tracking-wider font-medium ${statusColors[item.status || "Not Started"]}`}>
                        {item.status || "Not Started"}
                      </span>
                      {item.file_name && (
                        <span className="text-[10px] text-violet-600 flex items-center gap-1">
                          <File className="w-3 h-3" />
                          {item.file_name}
                        </span>
                      )}
                      {item.updated_date && (
                        <span className="text-[10px] text-slate-400">
                          Updated {new Date(item.updated_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Per-document share icon */}
                  <button
                    onClick={() => handleDocumentShare(item)}
                    title="Share this document"
                    className="flex-shrink-0 text-slate-300 hover:text-violet-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-slate-100 pt-3 bg-slate-50/50">
                    {/* File Upload Section */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 block">
                        Document Upload
                      </label>
                      {item.file_url ? (
                        <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                          <File className="w-4 h-4 text-violet-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <a
                              href={item.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-slate-800 hover:text-violet-600 font-medium block truncate"
                            >
                              {item.file_name}
                            </a>
                            {item.file_uploaded_date && (
                              <p className="text-[10px] text-slate-400">
                                Uploaded {new Date(item.file_uploaded_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            )}
                          </div>
                          <button onClick={() => handleFileRemove(item)} className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">Upload file</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.zip"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(item, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                      <p className="text-[9px] text-slate-400 mt-1.5">Accepted: PDF, Excel, CSV, Word, ZIP</p>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Status</label>
                      <Select value={item.status || "Not Started"} onValueChange={(v) => handleStatusChange(item, v)}>
                        <SelectTrigger className="bg-white border-slate-200 text-slate-800 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Not Started", "In Progress", "Complete"].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Notes</label>
                      <Textarea
                        value={item.notes || ""}
                        onChange={(e) => handleNotesChange(item, e.target.value)}
                        onBlur={(e) => handleNotesChange(item, e.target.value)}
                        className="bg-white border-slate-200 text-slate-800 text-sm min-h-[60px]"
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Activity Log */}
        <DataRoomActivity shares={[...shares].sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date))} />
      </div>
    </>
  );
}