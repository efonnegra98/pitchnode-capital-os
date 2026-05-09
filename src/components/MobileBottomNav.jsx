import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Send, Archive, Settings } from "lucide-react";
import { createPageUrl } from "../utils";

const NAV_ITEMS = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "CRM",       page: "Investors",     icon: Users },
  { label: "Updates",   page: "UpdateBuilder", icon: Send },
  { label: "Archive",   page: "UpdateArchive", icon: Archive },
  { label: "Settings",  page: "Settings",      icon: Settings },
];

export default function MobileBottomNav({ currentPageName }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border no-select"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-1">
        {NAV_ITEMS.map(({ label, page, icon: Icon }) => {
          const isActive = currentPageName === page;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              data-no-touch-target
              className={`flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl min-w-[52px] min-h-[52px] justify-center transition-colors active:bg-accent ${
                isActive ? "text-violet-600" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-[22px] h-[22px] ${isActive ? "text-violet-600" : ""}`} />
              <span className={`text-[10px] font-medium leading-none ${isActive ? "text-violet-600" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}