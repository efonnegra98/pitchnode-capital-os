import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Archive, MoreHorizontal, Pencil } from "lucide-react";
import UpdateForm from "../components/update/UpdateForm";
import UpdatePreview from "../components/update/UpdatePreview";
import { useCompany } from "../components/useCompany";
import toast, { Toaster } from "react-hot-toast";
import DuplicateDraftModal from "../components/update/DuplicateDraftModal";

function UpdateRow({ update, onEdit, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="w-full glass rounded-xl p-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
      <button className="flex items-center gap-4 flex-1 text-left" onClick={onEdit}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${update.status === "sent" ? "bg-emerald-500" : "bg-amber-500"}`} />
        <div>
          <p className="text-foreground font-medium text-sm">{update.month}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {update.status === "sent"
              ? `Sent ${update.sent_date ? new Date(update.sent_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}`
              : "Draft"}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-4">
        {update.revenue && (
          <span className="text-muted-foreground text-xs hidden sm:block">
            Rev: ${(update.revenue / 1000).toFixed(1)}k
          </span>
        )}
        {/* Three-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onArchive(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
              >
                <Archive className="w-3.5 h-3.5 text-slate-400" /> Archive
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UpdateBuilder() {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [duplicateDraft, setDuplicateDraft] = useState(null);
  const queryClient = useQueryClient();

  const { company, companyId, isLoading: companyLoading } = useCompany();

  const { data: updates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ["monthly-updates", companyId],
    queryFn: () => base44.entities.MonthlyUpdate.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const { data: investors = [] } = useQuery({
    queryKey: ["investors", companyId],
    queryFn: () => base44.entities.Investor.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const isLoading = companyLoading || updatesLoading;
  const companyName = company?.name || "";

  const createNewUpdateMutation = useMutation({
    mutationFn: async () => {
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const newUpdate = await base44.entities.MonthlyUpdate.create({
        company_id: companyId,
        month: currentMonth,
        status: "draft",
      });
      return newUpdate;
    },
    onSuccess: (newUpdate) => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
      setEditingId(newUpdate.id);
      setShowForm(true);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (!editingId) {
        throw new Error("No update ID");
      }
      return base44.entities.MonthlyUpdate.update(editingId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
      toast.success("Draft saved successfully!");
    },
    onError: (error) => {
      toast.error("Failed to save draft: " + error.message);
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      if (!editingId) {
        throw new Error("No update ID");
      }
      const payload = {
        ...data,
        status: "sent",
        sent_date: new Date().toISOString().split("T")[0],
      };
      return base44.entities.MonthlyUpdate.update(editingId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
      toast.success("Update marked as sent!");
      setShowForm(false);
      setEditingId(null);
    },
    onError: (error) => {
      toast.error("Failed to send update: " + error.message);
    },
  });

  const handleNewUpdate = () => {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const existingDraft = updates.find(u => u.month === currentMonth && u.status === 'draft');
    if (existingDraft) {
      setDuplicateDraft(existingDraft);
      return;
    }
    createNewUpdateMutation.mutate();
  };

  const handleEdit = (update) => {
    setEditingId(update.id);
    setFormData(update);
    setShowForm(true);
  };

  const archiveMutation = useMutation({
    mutationFn: (id) => base44.entities.MonthlyUpdate.update(id, { status: "archived" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
      toast.success("Update archived.");
    },
  });

  // Updates visible in the builder: drafts and sent — never archived
  const visibleUpdates = updates.filter((u) => u.status !== "archived");

  const editingUpdate = editingId ? updates.find((u) => u.id === editingId) : null;

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

  if (!showForm) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <Toaster position="top-right" />

      {duplicateDraft && (
        <DuplicateDraftModal
          draft={duplicateDraft}
          onOpenExisting={() => { setDuplicateDraft(null); handleEdit(duplicateDraft); }}
          onCreateNew={() => { setDuplicateDraft(null); createNewUpdateMutation.mutate(); }}
          onClose={() => setDuplicateDraft(null)}
        />
      )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Update Builder</h1>
            <p className="text-muted-foreground text-sm mt-1">Compose and send structured investor updates</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={createPageUrl("UpdateArchive")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all"
            >
              <Archive className="w-4 h-4" />
              View Archive
            </Link>
            <button
              onClick={handleNewUpdate}
              disabled={createNewUpdateMutation.isPending}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              + New Update
            </button>
          </div>
        </div>

        {/* Status legend */}
        {visibleUpdates.length > 0 && (
          <div className="flex items-center gap-4 mb-4 px-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Status:</span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Sent
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Draft
            </span>
          </div>
        )}

        {visibleUpdates.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center border border-slate-200">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Send className="w-6 h-6 text-slate-400" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">No Updates Yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Create your first investor update to share financial metrics and company progress.
            </p>
            <button
              onClick={handleNewUpdate}
              disabled={createNewUpdateMutation.isPending}
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              Create First Update
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleUpdates.map((update) => (
              <UpdateRow
                key={update.id}
                update={update}
                onEdit={() => handleEdit(update)}
                onArchive={() => archiveMutation.mutate(update.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {editingId ? "Edit Update" : "New Update"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Compose your monthly investor update</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <UpdateForm
          initialData={editingUpdate}
          onSave={(d) => saveMutation.mutate(d)}
          onSend={(d) => sendMutation.mutate(d)}
          onBack={() => { setShowForm(false); setEditingId(null); }}
          isSaving={saveMutation.isPending || sendMutation.isPending}
          onFormChange={setFormData}
          investors={investors}
          company={company}
        />
        <div className="hidden xl:block">
          <UpdatePreview
            data={formData}
            companyName={companyName}
            companyLogo={company?.logo_url}
          />
        </div>
      </div>
    </div>
  );
}