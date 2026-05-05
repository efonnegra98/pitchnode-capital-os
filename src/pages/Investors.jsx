import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompany } from "../components/useCompany";
import { suggestNextActionType } from "../lib/nextActionSuggestion";
import { Input } from "@/components/ui/input";
import { Search, Users, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import InvestorTable from "../components/investors/InvestorTable";
import InvestorBoard from "../components/investors/InvestorBoard";
import InvestorModal from "../components/investors/InvestorModal";
import FollowUpModal from "../components/investors/FollowUpModal";
import BulkUploadModal from "../components/investors/BulkUploadModal";

export default function Investors() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [quickFilter, setQuickFilter] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [modalData, setModalData] = useState(null);
  const [followUpInvestor, setFollowUpInvestor] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" | "board"

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const stageMutation = useMutation({
    mutationFn: ({ id, funnel_stage }) => base44.entities.Investor.update(id, { funnel_stage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investors", companyId] }),
  });
  const { companyId, isLoading: companyLoading } = useCompany();

  const { data: investors = [], isLoading: investorsLoading } = useQuery({
    queryKey: ["investors", companyId],
    queryFn: () => base44.entities.Investor.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const isLoading = companyLoading || investorsLoading;

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      // Strip empty strings from number fields so the API doesn't reject them
      const numberFields = ["portfolio_count", "check_size_min", "check_size_max"];
      const cleaned = { ...formData };
      numberFields.forEach(f => { if (cleaned[f] === "" || cleaned[f] === null) delete cleaned[f]; });

      const enriched = { ...cleaned, next_action_type: suggestNextActionType(cleaned) };
      if (enriched.id) {
        const { id, created_date, updated_date, created_by, ...rest } = enriched;
        return base44.entities.Investor.update(id, rest);
      }
      return base44.entities.Investor.create({ ...enriched, company_id: companyId });
    },
    onSuccess: (_, formData) => {
      queryClient.invalidateQueries({ queryKey: ["investors", companyId] });
      setModalData(null);
      if (!formData?.id) {
        toast({ description: "Firm added successfully." });
      }
    },
  });

  const followUpMutation = useMutation({
    mutationFn: ({ id, date, note, contactMethod }) =>
      base44.entities.Investor.update(id, {
        last_contact_date: date,
        ...(note?.trim() ? { last_note: note.trim() } : {}),
        ...(contactMethod ? { contact_method: contactMethod } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors", companyId] });
      setFollowUpInvestor(null);
      toast({ description: "Follow-up logged and last contact updated." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Investor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors", companyId] });
      setModalData(null);
    },
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedFiltered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = investors.filter((inv) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        inv.firm?.toLowerCase().includes(q) ||
        inv.name?.toLowerCase().includes(q) ||
        inv.notes?.toLowerCase().includes(q) ||
        inv.last_note?.toLowerCase().includes(q) ||
        inv.last_meeting_notes?.toLowerCase().includes(q);

      // Quick filter logic
      let matchQuick = true;
      if (quickFilter === "active") {
        matchQuick = ["Outreach Sent", "Intro Call Scheduled", "Intro Call Complete", "Interest Confirmed"].includes(inv.funnel_stage);
      } else if (quickFilter === "warm") {
        matchQuick = inv.sentiment === "Positive" || inv.sentiment === "Champion" || inv.status === "Warm" || inv.status === "Engaged";
      } else if (quickFilter === "cold") {
        const days = inv.last_contact_date
          ? Math.floor((today - new Date(inv.last_contact_date)) / (1000 * 60 * 60 * 24))
          : 999;
        matchQuick = days >= 14 || inv.sentiment === "Skeptical" || !inv.last_contact_date;
      } else if (quickFilter === "overdue") {
        const days = inv.last_contact_date
          ? Math.floor((today - new Date(inv.last_contact_date)) / (1000 * 60 * 60 * 24))
          : 999;
        matchQuick = days >= 21 || inv.cadence_status === "Overdue";
      } else if (quickFilter === "diligence") {
        matchQuick = inv.funnel_stage === "Diligence" || inv.funnel_stage === "Term Sheet";
      } else if (quickFilter === "closed") {
        matchQuick = ["Closed Won", "Closed Lost", "Pass"].includes(inv.funnel_stage);
      }

      const matchStage = filterStage === "all" || inv.funnel_stage === filterStage;
      const matchFirmType = filterStatus === "all" || inv.firm_type === filterStatus;
      const matchSentiment = filterSentiment === "all" || inv.sentiment === filterSentiment;
      return matchSearch && matchQuick && matchStage && matchFirmType && matchSentiment;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [investors, search, sortField, sortDir, filterStage, filterStatus, filterSentiment]);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Investor CRM</h1>
          <p className="text-muted-foreground text-sm mt-1">{investors.length} firms tracked</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* List / Board toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "list" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "board" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Board
            </button>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            Upload List
          </button>
          <button
            onClick={() => setModalData({})}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all whitespace-nowrap"
          >
            + Add Firm
          </button>
        </div>
      </div>

      {/* Search + Quick Filters */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Search bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search firm, contact, notes..."
            className="pl-9"
          />
        </div>

        {/* Quick filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all",       label: "All" },
            { key: "active",    label: "Active" },
            { key: "warm",      label: "Warm" },
            { key: "cold",      label: "Cold" },
            { key: "overdue",   label: "Overdue" },
            { key: "diligence", label: "Diligence" },
            { key: "closed",    label: "Closed" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setQuickFilter(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                quickFilter === key
                  ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-700"
              }`}
            >
              {label}
            </button>
          ))}

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Secondary dropdowns */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-violet-400"
          >
            <option value="all">Stage: All</option>
            {["Identified", "Researching", "Outreach Sent", "Intro Call Scheduled", "Intro Call Complete", "Interest Confirmed", "Diligence", "Term Sheet", "Closed Won", "Closed Lost", "Pass"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-violet-400"
          >
            <option value="all">Type: All</option>
            {["Venture Capital", "Angel", "Family Office", "Corporate / Strategic", "Accelerator", "Private Equity", "Operator", "Strategic Investor", "Search Fund", "Other"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-violet-400"
          >
            <option value="all">Sentiment: All</option>
            {["Champion", "Positive", "Curious", "Neutral", "Skeptical"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {(filterStage !== "all" || filterStatus !== "all" || filterSentiment !== "all") && (
            <button
              onClick={() => { setFilterStage("all"); setFilterStatus("all"); setFilterSentiment("all"); }}
              className="text-xs text-violet-600 hover:text-violet-800 font-medium px-2 py-1 rounded-md hover:bg-violet-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {investors.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-slate-200">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">No Investor Firms Yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Start building your investor pipeline by adding your first firm.
          </p>
          <button
            onClick={() => setModalData({})}
            className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-all"
          >
            Add First Firm
          </button>
        </div>
      ) : viewMode === "board" ? (
        <InvestorBoard
          investors={sortedFiltered}
          onEdit={(inv) => setModalData(inv)}
          onStageChange={(id, funnel_stage) => stageMutation.mutate({ id, funnel_stage })}
        />
      ) : (
        <InvestorTable
          investors={sortedFiltered}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={(inv) => setModalData(inv)}
          onFollowUp={(inv) => setFollowUpInvestor(inv)}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}

      {modalData !== null && (
        <InvestorModal
          investor={modalData}
          onSave={(data) => saveMutation.mutate(data)}
          onDelete={(id) => deleteMutation.mutate(id)}
          onClose={() => setModalData(null)}
          isSaving={saveMutation.isPending}
        />
      )}

      {showUpload && (
        <BulkUploadModal
          companyId={companyId}
          existingInvestors={investors}
          onClose={() => setShowUpload(false)}
          onImported={() => queryClient.invalidateQueries({ queryKey: ["investors", companyId] })}
        />
      )}

      {followUpInvestor && (
        <FollowUpModal
          investor={followUpInvestor}
          onSave={(id, date, note, contactMethod) => followUpMutation.mutate({ id, date, note, contactMethod })}
          onClose={() => setFollowUpInvestor(null)}
          isSaving={followUpMutation.isPending}
        />
      )}
    </div>
  );
}