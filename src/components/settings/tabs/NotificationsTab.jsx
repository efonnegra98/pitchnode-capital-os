import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-6">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        data-no-touch-target
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${checked ? "bg-violet-600" : "bg-muted border border-border"}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

const DEFAULTS = {
  notif_overdue_followup: true,
  notif_dataroom_views: true,
  notif_update_reminders: true,
  notif_round_milestones: true,
};

export default function NotificationsTab({ company, companyId, toast }) {
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState(DEFAULTS);

  useEffect(() => {
    if (company) {
      setPrefs({
        notif_overdue_followup: company.notif_overdue_followup ?? true,
        notif_dataroom_views: company.notif_dataroom_views ?? true,
        notif_update_reminders: company.notif_update_reminders ?? true,
        notif_round_milestones: company.notif_round_milestones ?? true,
      });
    }
  }, [company]);

  const set = (field, value) => setPrefs(prev => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Company.update(companyId, prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      toast({ title: "Preferences saved" });
    },
    onError: (err) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const TOGGLES = [
    {
      key: "notif_overdue_followup",
      label: "Overdue Follow-up Alerts",
      description: "Notify when an investor follow-up is past due.",
    },
    {
      key: "notif_dataroom_views",
      label: "Data Room View Notifications",
      description: "Notify when an investor opens your data room.",
    },
    {
      key: "notif_update_reminders",
      label: "Investor Update Reminders",
      description: "Remind you when it is time to send your monthly update.",
    },
    {
      key: "notif_round_milestones",
      label: "Round Milestone Alerts",
      description: "Notify when your round hits key commitment thresholds.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-7 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-1">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground mb-5">Choose which events trigger email notifications.</p>

        <div className="divide-y divide-border">
          {TOGGLES.map(({ key, label, description }) => (
            <Toggle
              key={key}
              checked={prefs[key]}
              onChange={v => set(key, v)}
              label={label}
              description={description}
            />
          ))}
        </div>
      </div>

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto"
      >
        <Save className="w-4 h-4 mr-2" />
        {saveMutation.isPending ? "Saving…" : "Save Preferences"}
      </Button>
    </div>
  );
}