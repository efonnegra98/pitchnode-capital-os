import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import UpdateForm from "../components/update/UpdateForm";
import UpdatePreview from "../components/update/UpdatePreview";

export default function UpdateBuilder() {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["monthly-updates"],
    queryFn: () => base44.entities.MonthlyUpdate.list("-created_date", 50),
  });

  const { data: settings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => base44.entities.CompanySettings.list(),
  });

  const companyName = settings?.[0]?.company_name || "";

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = { ...formData, status: "draft" };
      if (editingId) {
        return base44.entities.MonthlyUpdate.update(editingId, payload);
      }
      return base44.entities.MonthlyUpdate.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates"] });
      setShowForm(false);
      setEditingId(null);
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        ...formData,
        status: "sent",
        sent_date: new Date().toISOString().split("T")[0],
      };
      if (editingId) {
        return base44.entities.MonthlyUpdate.update(editingId, payload);
      }
      return base44.entities.MonthlyUpdate.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates"] });
      setShowForm(false);
      setEditingId(null);
    },
  });

  const handleEdit = (update) => {
    setEditingId(update.id);
    setShowForm(true);
  };

  const editingUpdate = editingId ? updates.find((u) => u.id === editingId) : null;

  const [previewData, setPreviewData] = useState({});

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Update Builder</h1>
            <p className="text-muted-foreground text-sm mt-1">Compose and send structured investor updates</p>
          </div>
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all"
          >
            + New Update
          </button>
        </div>

        {updates.length === 0 ? (
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
              onClick={() => { setEditingId(null); setShowForm(true); }}
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-all"
            >
              Create First Update
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((update) => (
              <button
                key={update.id}
                onClick={() => handleEdit(update)}
                className="w-full glass rounded-xl p-5 flex items-center justify-between hover:bg-slate-50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${update.status === 'sent' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-foreground font-medium text-sm">{update.month}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {update.status === 'sent'
                        ? `Sent ${update.sent_date ? new Date(update.sent_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}`
                        : 'Draft'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {update.revenue && (
                    <span className="text-muted-foreground text-xs">
                      Rev: ${(update.revenue / 1000).toFixed(1)}k
                    </span>
                  )}
                  <span className="text-slate-400 group-hover:text-slate-600 text-xs transition-colors">Edit →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
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
        />
        <div className="hidden xl:block">
          <UpdatePreview
            data={editingUpdate || {}}
            companyName={companyName}
          />
        </div>
      </div>
    </div>
  );
}