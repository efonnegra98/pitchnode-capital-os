import React from "react";
import { Loader2 } from "lucide-react";

export default function PullToRefreshIndicator({ pulling, pullDistance, refreshing }) {
  const show = pulling || refreshing;
  if (!show) return null;

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none transition-all duration-150"
      style={{ height: refreshing ? 56 : pullDistance, overflow: "hidden" }}
    >
      <div className={`flex flex-col items-center gap-1 ${refreshing ? "opacity-100" : "opacity-70"}`}>
        <Loader2
          className={`w-5 h-5 text-violet-600 ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${Math.min((pullDistance / 72) * 180, 180)}deg)` }}
        />
      </div>
    </div>
  );
}