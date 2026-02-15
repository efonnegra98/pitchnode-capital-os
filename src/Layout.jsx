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
        .nav-glow { box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08); }
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
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M20 10 L20 100 L45 100 L45 65 Q45 25 80 25 Q115 25 115 65 L115 100" 
                      className="fill-foreground" strokeWidth="0"/>
                <circle cx="95" cy="80" r="12" className="fill-violet-600" />
              </svg>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-foreground leading-tight">PitchNode</h1>
                <p className="text-[10px] text-violet-600/60 uppercase tracking-[0.2em] font-medium leading-none mt-0.5">Capital OS</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              const Icon = item.icon;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? "bg-violet-50 text-violet-700 nav-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }
                  `}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-600/40" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">v1.0 · Capital Grade</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M20 10 L20 100 L45 100 L45 65 Q45 25 80 25 Q115 25 115 65 L115 100" 
                    className="fill-foreground" strokeWidth="0"/>
              <circle cx="95" cy="80" r="12" className="fill-violet-600" />
            </svg>
            <span className="text-sm font-semibold text-foreground">PitchNode</span>
          </div>
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