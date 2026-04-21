import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import TrialBanner from "@/components/TrialBanner";
import {
  LayoutDashboard,
  Send,
  Archive,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
  Shield
} from "lucide-react";

const navItems = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Update Builder", page: "UpdateBuilder", icon: Send },
  { name: "Investors", page: "Investors", icon: Users },
  { name: "Archive", page: "UpdateArchive", icon: Archive },
  { name: "Settings", page: "Settings", icon: Settings },
];

function LayoutContent({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: company } = useQuery({
    queryKey: ["company", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      const companies = await base44.entities.Company.filter({ id: profile.company_id });
      return companies[0] || null;
    },
    enabled: !!profile?.company_id,
  });

  useEffect(() => {
    const checkAccess = async () => {
      // Skip check for public pages
      if (currentPageName === "Gateway" || currentPageName === "AccessRequest" || currentPageName === "Onboarding" || currentPageName === "Upgrade" || currentPageName === "TrialExpired") {
        setCheckingAccess(false);
        return;
      }

      try {
        const user = await base44.auth.me();
        if (!user) {
          setCheckingAccess(false);
          return;
        }

        // Check if user has a profile and if onboarding is completed
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        
        // If no profile exists, redirect to onboarding
        if (profiles.length === 0) {
          navigate(createPageUrl("Onboarding"));
          return;
        }

        // Check if onboarding is completed
        if (!profiles[0].onboarding_completed) {
          navigate(createPageUrl("Onboarding"));
          return;
        }

        // Verify user has a company_id
        if (!profiles[0].company_id) {
          navigate(createPageUrl("Onboarding"));
          return;
        }

        // Admins and owners bypass trial/subscription checks entirely
        if (user.role === "admin" || user.role === "owner") {
          setCheckingAccess(false);
          return;
        }

        // Check trial status
        const companies = await base44.entities.Company.filter({ id: profiles[0].company_id });
        const company = companies[0];
        
        if (company) {
          const now = new Date();
          const trialEnd = new Date(company.trial_end_date);
          const isTrialExpired = company.subscription_status !== "active" && now > trialEnd;
          
          if (isTrialExpired) {
            navigate(createPageUrl("TrialExpired"));
            return;
          }
        }

        setCheckingAccess(false);
      } catch (error) {
        console.error("Access check error:", error);
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [currentPageName, navigate]);

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <style>{`
        .metric-glow { box-shadow: 0 4px 16px rgba(109, 93, 246, 0.06); }
        .glass { background: hsl(var(--card)); border: 1px solid hsl(var(--border)); box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }
        .glass-hover:hover { background: hsl(var(--accent)); }
        .gradient-text { background: linear-gradient(135deg, #8B7FF6, #6D5DF6, #5346E0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-border { border-image: linear-gradient(135deg, #6D5DF6, #5346E0) 1; }
        .accent-line { background: linear-gradient(180deg, #6D5DF6, transparent); }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50
        bg-card border-r border-border
        flex flex-col
        transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Branding */}
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png" 
              alt="PitchNode" 
              className="h-[42px] w-auto"
            />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-8">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              const Icon = item.icon;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group relative flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-medium
                    transition-colors duration-150
                    ${isActive
                      ? "bg-[#6D5DF6]/10 text-[#6D5DF6]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }
                  `}
                >
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#6D5DF6] rounded-r" />}
                  <Icon className="w-[16px] h-[16px] flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Admin link — only visible to admins, separated by divider */}
        {user?.role === "admin" && (
          <div className="px-4 pb-2 border-t border-slate-100 pt-3 mt-2">
            <Link
              to={createPageUrl("Admin")}
              onClick={() => setSidebarOpen(false)}
              className={`
                group relative flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-medium
                transition-colors duration-150
                ${currentPageName === "Admin"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "text-slate-500 hover:text-slate-800 hover:bg-amber-50/60 border border-transparent hover:border-amber-100"
                }
              `}
            >
              <Shield className="w-[16px] h-[16px] flex-shrink-0 text-amber-500" />
              <span>Admin Console</span>
              <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 border border-amber-200 rounded px-1 py-0.5">Admin</span>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3">
          <p className="text-[9px] text-slate-400 tracking-wider">v1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-slate-700">
            <Menu className="w-5 h-5" />
          </button>
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png" 
            alt="PitchNode" 
            className="h-[28px] w-auto"
          />
          <div className="w-5" />
        </div>

        {/* Trial Banner */}
        {currentPageName !== "Gateway" && currentPageName !== "AccessRequest" && currentPageName !== "Onboarding" && currentPageName !== "Upgrade" && currentPageName !== "TrialExpired" && (
          <TrialBanner company={company} user={user} />
        )}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return <LayoutContent children={children} currentPageName={currentPageName} />;
}