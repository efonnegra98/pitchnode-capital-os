import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  Send,
  Archive,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

const navItems = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Update Builder", page: "UpdateBuilder", icon: Send },
  { name: "Archive", page: "UpdateArchive", icon: Archive },
  { name: "Investors", page: "Investors", icon: Users },
  { name: "Settings", page: "Settings", icon: Settings },
];

function LayoutContent({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      // Skip check for public pages
      if (currentPageName === "Gateway" || currentPageName === "AccessRequest" || currentPageName === "Onboarding") {
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
        .metric-glow { box-shadow: 0 4px 16px rgba(124, 58, 237, 0.06); }
        .glass { background: hsl(var(--card)); border: 1px solid hsl(var(--border)); box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }
        .glass-hover:hover { background: hsl(var(--accent)); }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #7c3aed, #6d28d9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-border { border-image: linear-gradient(135deg, #7c3aed, #4f46e5) 1; }
        .accent-line { background: linear-gradient(180deg, #7c3aed, transparent); }
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
        <div className="px-5 py-6">
          <div className="flex items-center justify-between">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698fe466c243851910a585ea/ae8a53466_pn_black_full3.png" 
              alt="PitchNode" 
              className="h-[36px] w-auto"
            />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-4">
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
                      ? "bg-violet-50/80 text-violet-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }
                  `}
                >
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-violet-600 rounded-r" />}
                  <Icon className="w-[16px] h-[16px] flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

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