import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Send, Archive, Settings } from "lucide-react";
import { createPageUrl } from "../utils";

const NAV_ITEMS = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "CRM", page: "Investors", icon: Users },
  { label: "Updates", page: "UpdateBuilder", icon: Send },
  { label: "Archive", page: "UpdateArchive", icon: Archive },
  { label: "Settings", page: "Settings", icon: Settings },
];

export default function MobileBottomNav({ currentPageName }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map(({ label, page, icon: Icon }) => {
          const isActive = currentPageName === page;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[44px] min-h-[44px] justify-center transition-colors active:bg-accent ${
                isActive ? "text-violet-600" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-violet-600" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-violet-600" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}