import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
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

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0914] text-white flex">
      <style>{`
        .nav-glow { box-shadow: 0 0 20px rgba(124, 58, 237, 0.15); }
        .metric-glow { box-shadow: 0 0 30px rgba(124, 58, 237, 0.1); }
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); }
        .glass-hover:hover { background: rgba(255,255,255,0.06); }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #7c3aed, #6d28d9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-border { border-image: linear-gradient(135deg, #7c3aed, #4f46e5) 1; }
        .accent-line { background: linear-gradient(180deg, #7c3aed, transparent); }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50
        bg-[#0d0b1a] border-r border-white/[0.06]
        flex flex-col
        transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-white">PitchNode</h1>
                <p className="text-[10px] text-violet-400/70 uppercase tracking-[0.2em] font-medium">Capital OS</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white">
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
                      ? "bg-violet-600/15 text-violet-300 nav-glow"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                    }
                  `}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-400/50" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.04]">
          <p className="text-[10px] text-white/20 text-center uppercase tracking-widest">v1.0 · Capital Grade</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/[0.06]">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">P</span>
            </div>
            <span className="text-sm font-semibold text-white">PitchNode</span>
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