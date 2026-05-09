import React, { useState, useMemo, useRef, useCallback } from "react";
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
import LogActivityModal from "../components/investors/LogActivityModal";
import InvestorMobileCard from "../components/investors/InvestorMobileCard";
import MobilePickerSheet from "../components/ui/MobilePickerSheet";
import PullToRefreshIndicator from "../components/ui/PullToRefreshIndicator";
import { usePullToRefresh } from "../lib/usePullToRefresh";

const STAGE_OPTIONS = [
  { value: "all", label: "Stage: All" },
  ...["Identified","Researching","Outreach Sent","Intro Call Scheduled","Intro Call Complete","Interest Confirmed","Diligence","Term Sheet","Closed Won","Closed Lost","Pass"].map(s => ({ value: s, label: s }))
];
const TYPE_OPTIONS = [
  { value: "all", label: "Type: All" },
  ...["Venture Capital","Angel","Family Office","Corporate / Strategic","Accelerator","Private Equity","Operator","Strategic Investor","Search Fund","Other"].map(s => ({ value: s, label: s }))
];
const SENTIMENT_OPTIONS = [
  { value: "all", label: "Sentiment: All" },
  ...["Champion","Positive","Curious","Neutral","Skeptical"].map(s => ({ value: s, label: s }))
];

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
  const [viewMode, setViewMode] = useState("list");
  const [logActivityInvestor, setLogActivityInvestor] = useState(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);

  const { companyId, isLoading: companyLoading } = useCompany();

  const { data: investors = [], isLoading: investorsLoading, refetch: refetchInvestors } = useQuery({
    queryKey: ["investors", companyId],
    queryFn: () => base44.entities.Investor.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const { data: allActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ["investor-activities", companyId],
    queryFn: async () => {
      if (!investors.length) return [];
      const ids = investors.map(i => i.id);
      const acts = await base44.entities.InvestorActivity.list("-date", 500);
      return acts.filter(a => ids.includes(a.investor_id));
    },
    enabled: !!companyId && investors.length > 0,
  });

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchInvestors(), refetchActivities()]);
  }, [refetchInvestors, refetchActivities]);

  const { pulling, pullDistance, refreshing } = usePullToRefresh(scrollRef, handleRefresh);

  const isLoading = companyLoading || investorsLoading;

  const stageMutation = useMutation({
    mutationFn: ({ id, funnel_stage }) => base44.entities.Investor.update(id, { funnel_stage }),
    onMutate: async ({ id, funnel_stage }) => {
      await queryClient.cancelQueries({ queryKey: ["investors", companyId] });
      const prev = queryClient.getQueryData(["investors", companyId]);
      queryClient.setQueryData(["investors", companyId], old =>
        old?.map(inv => inv.id === id ? { ...inv, funnel_stage } : inv) ?? old
      );
      return { prev };
    },
    onError: (_, __, ctx) => { queryClient.setQueryData(["investors", companyId], ctx.prev); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["investors", companyId] }),
  });

  // Optimistic save (add/edit)
  const saveMutation = useMutation({
    mutationFn: async (formData) => {
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
    onMutate: async (formData) => {
      await queryClient.cancelQueries({ queryKey: ["investors", companyId] });
      const prev = queryClient.getQueryData(["investors", companyId]);
      if (formData.id) {
        queryClient.setQueryData(["investors", companyId], old =>
          old?.map(inv => inv.id === formData.id ? { ...inv, ...formData } : inv) ?? old
        );
      } else {
        const optimistic = { ...formData, id: `temp-${Date.now()}`, company_id: companyId };
        queryClient.setQueryData(["investors", companyId], old => [...(old ?? []), optimistic]);
      }
      setModalData(null);
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["investors", companyId], ctx.prev);
      toast({ description: "Failed to save. Changes reverted.", variant: "destructive" });
    },
    onSuccess: (_, formData) => {
      if (!formData?.id) toast({ description: "Firm added successfully." });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["investors", companyId] }),
  });

  // Optimistic log activity
  const logActivityMutation = useMutation({
    mutationFn: async ({ investorId, activityData }) => {
      await base44.entities.InvestorActivity.create({ ...activityData, investor_id: investorId });
      await base44.entities.Investor.update(investorId, { last_contact_date: activityData.date });
    },
    onMutate: async ({ investorId, activityData }) => {
      const prev = queryClient.getQueryData(["investors", companyId]);
      queryClient.setQueryData(["investors", companyId], old =>
        old?.map(inv => inv.id === investorId ? { ...inv, last_contact_date: activityData.date } : inv) ?? old
      );
      setLogActivityInvestor(null);
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["investors", companyId], ctx.prev);
      toast({ description: "Failed to log activity.", variant: "destructive" });
    },
    onSuccess: () => toast({ description: "Activity logged successfully." }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["investors", companyId] });
      queryClient.invalidateQueries({ queryKey: ["investor-activities", companyId] });
    },
  });

  const followUpMutation = useMutation({
    mutationFn: ({ id, date, note, contactMethod }) =>
      base44.entities.Investor.update(id, {
        last_contact_date: date,
        ...(note?.trim() ? { last_note: note.trim() } : {}),
        ...(contactMethod ? { contact_method: contactMethod } : {}),
      }),
    onMutate: async ({ id, date, note, contactMethod }) => {
      const prev = queryClient.getQueryData(["investors", companyId]);
      queryClient.setQueryData(["investors", companyId], old =>
        old?.map(inv => inv.id === id ? { ...inv, last_contact_date: date, ...(note?.trim() ? { last_note: note } : {}), ...(contactMethod ? { contact_method: contactMethod } : {}) } : inv) ?? old
      );
      setFollowUpInvestor(null);
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["investors", companyId], ctx.prev);
      toast({ description: "Failed to log follow-up.", variant: "destructive" });
    },
    onSuccess: () => toast({ description: "Follow-up logged and last contact updated." }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["investors", companyId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Investor.delete(id),
    onMutate: async (id) => {
      const prev = queryClient.getQueryData(["investors", companyId]);
      queryClient.setQueryData(["investors", companyId], old => old?.filter(inv => inv.id !== id) ?? old);
      setModalData(null);
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["investors", companyId], ctx.prev);
      toast({ description: "Delete failed.", variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["investors", companyId] }),
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
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
      let matchQuick = true;
      if (quickFilter === "active") {
        matchQuick = ["Outreach Sent","Intro Call Scheduled","Intro Call Complete","Interest Confirmed"].includes(inv.funnel_stage);
      } else if (quickFilter === "warm") {
        matchQuick = inv.sentiment === "Positive" || inv.sentiment === "Champion" || inv.status === "Warm" || inv.status === "Engaged";
      } else if (quickFilter === "cold") {
        const days = inv.last_contact_date ? Math.floor((today - new Date(inv.last_contact_date)) / 86400000) : 999;
        matchQuick = days >= 14 || inv.sentiment === "Skeptical" || !inv.last_contact_date;
      } else if (quickFilter === "overdue") {
        const days = inv.last_contact_date ? Math.floor((today - new Date(inv.last_contact_date)) / 86400000) : 999;
        matchQuick = days >= 21 || inv.cadence_status === "Overdue";
      } else if (quickFilter === "diligence") {
        matchQuick = inv.funnel_stage === "Diligence" || inv.funnel_stage === "Term Sheet";
      } else if (quickFilter === "closed") {
        matchQuick = ["Closed Won","Closed Lost","Pass"].includes(inv.funnel_stage);
      }
      const matchStage = filterStage === "all" || inv.funnel_stage === filterStage;
      const matchFirmType = filterStatus === "all" || inv.firm_type === filterStatus;
      const matchSentiment = filterSentiment === "all" || inv.sentiment === filterSentiment;
      return matchSearch && matchQuick && matchStage && matchFirmType && matchSentiment;
    });
    filtered.sort((a, b) => {
      const cmp = String(a[sortField] || "").localeCompare(String(b[sortField] || ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return filtered;
  }, [investors, search, sortField, sortDir, filterStage, filterStatus, filterSentiment, quickFilter]);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="ptr-container min-h-screen bg-background" style={{ overflowY: "auto" }}>
      <PullToRefreshIndicator pulling={pulling} pullDistance={pullDistance} refreshing={refreshing} />

      <div className="p-4 lg:p-10 max-w-7xl mx-auto">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 no-select">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Investor CRM</h1>
            <p className="text-muted-foreground text-sm mt-1">{investors.length} firms tracked</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
              <button data-no-touch-target onClick={() => setViewMode("list")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>List</button>
              <button data-no-touch-target onClick={() => setViewMode("board")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "board" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Board</button>
            </div>
            <button onClick={() => setShowUpload(true)} className="px-4 py-2.5 rounded-lg border border-border hover:bg-accent text-foreground text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> Upload List
            </button>
            <button onClick={() => setModalData({})} className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all whitespace-nowrap">
              + Add Firm
            </button>
          </div>
        </div>

        {/* Search + Quick Filters */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search firm, contact, notes..." className="pl-9 w-full" />
          </div>

          {/* Quick filter chips — horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar no-select">
            {[
              { key: "all", label: "All" }, { key: "active", label: "Active" }, { key: "warm", label: "Warm" },
              { key: "cold", label: "Cold" }, { key: "overdue", label: "Overdue" }, { key: "diligence", label: "Diligence" }, { key: "closed", label: "Closed" },
            ].map(({ key, label }) => (
              <button
                key={key}
                data-no-touch-target
                onClick={() => setQuickFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex-shrink-0 ${
                  quickFilter === key
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-violet-400 hover:text-violet-600"
                }`}
              >
                {label}
              </button>
            ))}

            <div className="w-px h-5 bg-border mx-1 hidden sm:block flex-shrink-0" />

            {/* Mobile picker sheets / desktop selects */}
            <MobilePickerSheet value={filterStage} onChange={setFilterStage} options={STAGE_OPTIONS} placeholder="Stage" />
            <MobilePickerSheet value={filterStatus} onChange={setFilterStatus} options={TYPE_OPTIONS} placeholder="Type" />
            <MobilePickerSheet value={filterSentiment} onChange={setFilterSentiment} options={SENTIMENT_OPTIONS} placeholder="Sentiment" />

            {(filterStage !== "all" || filterStatus !== "all" || filterSentiment !== "all") && (
              <button
                data-no-touch-target
                onClick={() => { setFilterStage("all"); setFilterStatus("all"); setFilterSentiment("all"); }}
                className="text-xs text-violet-600 hover:text-violet-500 font-medium px-2 py-1 rounded-md hover:bg-violet-500/10 transition-colors flex-shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {investors.length === 0 ? (
          <div className="rounded-xl p-12 text-center border border-border">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2 no-select">No Investor Firms Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto no-select">
              Start building your investor pipeline by adding your first firm.
            </p>
            <button onClick={() => setModalData({})} className="px-4 py-2.5 rounded-lg bg-foreground hover:opacity-90 text-background text-sm font-medium transition-all">
              Add First Firm
            </button>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden bg-card rounded-xl border border-border overflow-hidden">
              {sortedFiltered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm no-select">No results found.</div>
              ) : (
                sortedFiltered.map(inv => (
                  <InvestorMobileCard key={inv.id} investor={inv} onClick={(inv) => setModalData(inv)} />
                ))
              )}
            </div>

            {/* Desktop table/board */}
            <div className="hidden sm:block">
              {viewMode === "board" ? (
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
                  onLogActivity={(inv) => setLogActivityInvestor(inv)}
                  activitiesByInvestor={Object.fromEntries(
                    investors.map(inv => [inv.id, allActivities.filter(a => a.investor_id === inv.id)])
                  )}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {modalData !== null && (
        <InvestorModal
          investor={modalData}
          onSave={(data) => saveMutation.mutate(data)}
          onDelete={(id) => deleteMutation.mutate(id)}
          onClose={() => setModalData(null)}
          isSaving={saveMutation.isPending}
          activities={allActivities.filter(a => a.investor_id === modalData?.id)}
          onLogActivity={modalData?.id ? () => setLogActivityInvestor(modalData) : undefined}
        />
      )}

      {logActivityInvestor && (
        <LogActivityModal
          investor={logActivityInvestor}
          onSave={(data) => logActivityMutation.mutate({ investorId: logActivityInvestor.id, activityData: data })}
          onClose={() => setLogActivityInvestor(null)}
          isSaving={logActivityMutation.isPending}
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

      {/* Mobile FAB — above bottom nav + safe area */}
      <button
        onClick={() => setModalData({})}
        className="sm:hidden fixed right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform no-select"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)" }}
        aria-label="Add firm"
      >
        +
      </button>
    </div>
  );
}