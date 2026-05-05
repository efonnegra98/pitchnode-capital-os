import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompany } from "../components/useCompany";
import { Archive, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import UpdatesAnalyticsBar from "../components/investorUpdates/UpdatesAnalyticsBar";
import UpdatesList from "../components/investorUpdates/UpdatesList";
import UpdateComposer from "../components/investorUpdates/UpdateComposer";

export default function InvestorUpdates() {
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { company, companyId, isLoading: companyLoading } = useCompany();

  const { data: updates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ["monthly-updates", companyId],
    queryFn: () => base44.entities.MonthlyUpdate.filter({ company_id: companyId }, "-created_date", 100),
    enabled: !!companyId,
  });

  const { data: investors = [] } = useQuery({
    queryKey: ["investors", companyId],
    queryFn: () => base44.entities.Investor.filter({ company_id: companyId }),
    enabled: !!companyId,
  });

  const isLoading = companyLoading || updatesLoading;

  // Deduplicate by ID, then filter out archived
  const visibleUpdates = Array.from(
    new Map(updates.map(u => [u.id, u])).values()
  ).filter(u => u.status !== "archived");

  const createMutation = useMutation({
    mutationFn: async () => {
      const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
      return base44.entities.MonthlyUpdate.create({
        company_id: companyId,
        month: currentMonth,
        subject_line: `Capital OS Update — ${currentMonth}`,
        from_name: company?.founder_name || "",
        status: "draft",
      });
    },
    onSuccess: (newUpdate) => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
      setSelectedUpdate(newUpdate);
      setShowComposer(true);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const { id, created_date, updated_date, created_by, ...rest } = data;
      return base44.entities.MonthlyUpdate.update(selectedUpdate.id, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
      toast({ description: "Draft saved." });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_date, updated_date, created_by, ...rest } = data;
      const recipientIds = data.recipient_ids || [];
      const recipientInvestors = investors.filter(i => recipientIds.includes(i.id));

      // Build email HTML
      const fmtCurrency = (v) => v ? (v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${Number(v).toLocaleString()}`) : null;

      const financialRows = [
        data.revenue && `<tr><td style="padding:5px 0;color:#64748b;font-size:13px;">MRR</td><td style="padding:5px 0;text-align:right;font-weight:600;color:#1e293b;">${fmtCurrency(data.revenue)}</td></tr>`,
        data.revenue_growth ? `<tr><td style="padding:5px 0;color:#64748b;font-size:13px;">MoM Growth</td><td style="padding:5px 0;text-align:right;font-weight:600;color:${data.revenue_growth > 0 ? '#10b981' : '#ef4444'};">${data.revenue_growth > 0 ? '+' : ''}${data.revenue_growth}%</td></tr>` : null,
        data.burn_rate && `<tr><td style="padding:5px 0;color:#64748b;font-size:13px;">Burn Rate</td><td style="padding:5px 0;text-align:right;font-weight:600;color:#1e293b;">${fmtCurrency(data.burn_rate)}/mo</td></tr>`,
        data.runway_months && `<tr><td style="padding:5px 0;color:#64748b;font-size:13px;">Runway</td><td style="padding:5px 0;text-align:right;font-weight:600;color:#1e293b;">${data.runway_months} months</td></tr>`,
        data.cash_balance && `<tr><td style="padding:5px 0;color:#64748b;font-size:13px;">Cash</td><td style="padding:5px 0;text-align:right;font-weight:600;color:#1e293b;">${fmtCurrency(data.cash_balance)}</td></tr>`,
      ].filter(Boolean).join("");

      const section = (title, content) => content ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7c3aed;margin-bottom:8px;">${title}</div>
          <div style="font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap;">${content}</div>
        </div>` : "";

      const logoHtml = company?.logo_url ? `<img src="${company.logo_url}" style="height:32px;margin-bottom:12px;display:block;" />` : "";

      const emailBody = `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#6d5df6,#4f46e5);padding:32px 36px;">
            ${logoHtml}
            <div style="font-size:20px;font-weight:700;color:#fff;">${data.subject_line || `${data.month} Investor Update`}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px;">From ${data.from_name || company?.founder_name || "the Founder"} · ${company?.name || ""}</div>
          </div>
          <div style="padding:32px 36px;">
            ${financialRows ? `<div style="margin-bottom:24px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7c3aed;margin-bottom:12px;">Financial Snapshot</div>
              <table style="width:100%;border-top:1px solid #f1f5f9;border-collapse:collapse;">${financialRows}</table>
            </div>` : ""}
            ${section("Headline Summary", data.highlights)}
            ${section("Key Wins", data.key_wins)}
            ${section("Product Updates", data.product_updates)}
            ${section("Hiring & Team", data.hiring_updates)}
            ${section("Challenges", data.challenges)}
            ${section("Ask", data.asks)}
          </div>
          <div style="padding:20px 36px;border-top:1px solid #f1f5f9;background:#f8fafc;text-align:center;">
            <p style="font-size:11px;color:#94a3b8;margin:0;">Sent via Capital OS · <a href="#" style="color:#7c3aed;text-decoration:none;">Unsubscribe</a></p>
          </div>
        </div>
      `;

      const subject = data.subject_line || `${data.month} Investor Update`;
      const fromName = data.from_name || company?.founder_name || company?.name || "Your Investor Update";

      // Send emails to each recipient
      for (const inv of recipientInvestors) {
        if (inv.email) {
          // Embed a tracking pixel unique to this update + recipient
          const trackingPixelUrl = `https://capital-engage-hub.base44.app/api/trackEmailOpen?updateId=${selectedUpdate.id}&recipientId=${inv.id}`;
          const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;width:1px;height:1px;opacity:0;" alt="" />`;
          const bodyWithTracking = emailBody + trackingPixel;

          await base44.integrations.Core.SendEmail({
            to: inv.email,
            subject,
            body: bodyWithTracking,
            from_name: fromName,
          });
        }

        // Log activity on investor profile
        const activityEntry = {
          text: `Investor Update sent — ${data.month} Investor Update — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
          timestamp: new Date().toISOString(),
          type: "update_sent",
        };
        const existingLog = inv.activity_log || [];
        await base44.entities.Investor.update(inv.id, {
          activity_log: [...existingLog, activityEntry],
        });
      }

      // Update the MonthlyUpdate record
      return base44.entities.MonthlyUpdate.update(selectedUpdate.id, {
        ...rest,
        status: "sent",
        sent_date: new Date().toISOString().split("T")[0],
        recipients_count: recipientInvestors.length,
        opened_count: 0,
        opened_investor_ids: [],
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
      queryClient.invalidateQueries({ queryKey: ["investors", companyId] });
      setSelectedUpdate(updated);
      toast({ title: "Update sent!", description: `Delivered to ${updated.recipients_count} investor${updated.recipients_count !== 1 ? "s" : ""}.` });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ data, scheduledDate }) => {
      const { id, created_date, updated_date, created_by, ...rest } = data;
      return base44.entities.MonthlyUpdate.update(selectedUpdate.id, {
        ...rest,
        status: "scheduled",
        scheduled_date: scheduledDate,
        recipients_count: (data.recipient_ids || []).length,
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
      setSelectedUpdate(updated);
      toast({ description: "Update scheduled for delivery." });
    },
  });

  const handleNewUpdate = () => {
    createMutation.mutate();
  };

  const handleSelect = (update) => {
    setSelectedUpdate(update);
    setShowComposer(true);
  };

  const handleBack = () => {
    setShowComposer(false);
    setSelectedUpdate(null);
    queryClient.invalidateQueries({ queryKey: ["monthly-updates", companyId] });
  };

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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Investor Updates</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Compose, send, and track investor communications</p>
        </div>
        <Link
          to={createPageUrl("UpdateArchive")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-accent text-sm font-medium transition-all"
        >
          <Archive className="w-4 h-4" />
          Archive
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Updates list */}
        <div className={`
          flex-shrink-0 border-r border-border bg-card overflow-y-auto
          ${showComposer ? "hidden lg:flex lg:flex-col w-72 xl:w-80" : "flex flex-col w-full lg:w-72 xl:w-80"}
          p-4
        `}>
          <UpdatesAnalyticsBar updates={visibleUpdates} />
          <UpdatesList
            updates={visibleUpdates}
            selectedId={selectedUpdate?.id}
            onSelect={handleSelect}
            onNew={handleNewUpdate}
            isCreating={createMutation.isPending}
          />
        </div>

        {/* RIGHT: Composer */}
        {showComposer ? (
          <div className="flex-1 overflow-y-auto bg-card">
            <UpdateComposer
              update={selectedUpdate}
              investors={investors}
              company={company}
              onSave={(data) => saveMutation.mutate(data)}
              onSend={(data) => sendMutation.mutate(data)}
              onSchedule={(data, dt) => scheduleMutation.mutate({ data, scheduledDate: dt })}
              onBack={handleBack}
              isSaving={saveMutation.isPending || sendMutation.isPending || scheduleMutation.isPending}
            />
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-background">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-violet-500" />
              </div>
              <p className="text-base font-semibold text-foreground mb-2">Select an update to view or edit</p>
              <p className="text-sm text-muted-foreground mb-5">Or create a new investor update</p>
              <button
                onClick={handleNewUpdate}
                disabled={createMutation.isPending}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                + New Update
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}