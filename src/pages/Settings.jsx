import React, { useState } from "react";
import { useCompany } from "../components/useCompany";
import { useTheme } from "@/lib/ThemeContext";
import { useToast } from "@/components/ui/use-toast";
import ProfileTab from "../components/settings/tabs/ProfileTab";
import CompanyTab from "../components/settings/tabs/CompanyTab";
import NotificationsTab from "../components/settings/tabs/NotificationsTab";
import BillingTab from "../components/settings/tabs/BillingTab";
import SecurityTab from "../components/settings/tabs/SecurityTab";
import SupportTab from "../components/settings/tabs/SupportTab";

const TABS = [
  { key: "profile",       label: "Profile" },
  { key: "company",       label: "Company" },
  { key: "notifications", label: "Notifications" },
  { key: "billing",       label: "Billing" },
  { key: "security",      label: "Security" },
  { key: "support",       label: "Support" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { company, companyId, isLoading, user, profile } = useCompany();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-background pb-24">
      {/* Page Header */}
      <div className="px-4 lg:px-10 pt-8 pb-0 border-b border-border bg-card">
        <h1 className="text-2xl font-bold text-foreground tracking-tight px-0">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1 mb-5">Manage your account and preferences</p>

        {/* Tab bar */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              data-no-touch-target
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === key
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 lg:px-10 py-8 max-w-3xl">
        {activeTab === "profile" && (
          <ProfileTab user={user} profile={profile} theme={theme} setTheme={setTheme} toast={toast} />
        )}
        {activeTab === "company" && (
          <CompanyTab company={company} companyId={companyId} toast={toast} />
        )}
        {activeTab === "notifications" && (
          <NotificationsTab company={company} companyId={companyId} toast={toast} />
        )}
        {activeTab === "billing" && (
          <BillingTab company={company} companyId={companyId} user={user} profile={profile} toast={toast} />
        )}
        {activeTab === "security" && (
          <SecurityTab user={user} toast={toast} />
        )}
        {activeTab === "support" && (
          <SupportTab user={user} toast={toast} />
        )}
      </div>
    </div>
  );
}