import React from "react";
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";

export default function RaiseMomentum({ investors }) {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Calculate activity metrics
  const recentInvestors = investors.filter((inv) => {
    if (!inv.created_date) return false;
    const createdDate = new Date(inv.created_date);
    return createdDate >= fourteenDaysAgo;
  }).length;

  const recentMeetings = investors.filter((inv) => {
    if (!inv.next_action_date) return false;
    const actionDate = new Date(inv.next_action_date);
    const isRecent = actionDate >= fourteenDaysAgo;
    const isMeeting = inv.next_action_type && 
      (inv.next_action_type.includes("Meeting") || inv.next_action_type.includes("Intro"));
    return isRecent && isMeeting;
  }).length;

  const recentFollowUps = investors.filter((inv) => {
    if (!inv.last_contact_date) return false;
    const contactDate = new Date(inv.last_contact_date);
    return contactDate >= fourteenDaysAgo;
  }).length;

  const totalActivity = recentInvestors + recentMeetings + recentFollowUps;

  // Determine momentum status
  let status, icon, iconColor, bgColor, textColor, borderColor;

  if (totalActivity >= 10) {
    status = "Strong Momentum";
    icon = TrendingUp;
    iconColor = "text-emerald-600";
    bgColor = "bg-emerald-50";
    textColor = "text-emerald-700";
    borderColor = "border-emerald-200";
  } else if (totalActivity >= 5) {
    status = "Stable";
    icon = Activity;
    iconColor = "text-blue-600";
    bgColor = "bg-blue-50";
    textColor = "text-blue-700";
    borderColor = "border-blue-200";
  } else if (totalActivity >= 2) {
    status = "Slowing";
    icon = TrendingDown;
    iconColor = "text-amber-600";
    bgColor = "bg-amber-50";
    textColor = "text-amber-700";
    borderColor = "border-amber-200";
  } else {
    status = "At Risk";
    icon = AlertTriangle;
    iconColor = "text-red-600";
    bgColor = "bg-red-50";
    textColor = "text-red-700";
    borderColor = "border-red-200";
  }

  const Icon = icon;

  return (
    <div className="glass rounded-xl p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Raise Momentum</h2>
          <p className="text-slate-400 text-xs mt-1">14-day activity indicator</p>
        </div>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>

      <div className={`${bgColor} ${borderColor} border rounded-lg px-4 py-3 mb-4`}>
        <p className={`text-sm font-semibold ${textColor}`}>{status}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">New Contacts</p>
          <p className="text-lg font-bold text-foreground">{recentInvestors}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meetings</p>
          <p className="text-lg font-bold text-foreground">{recentMeetings}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Follow-Ups</p>
          <p className="text-lg font-bold text-foreground">{recentFollowUps}</p>
        </div>
      </div>
    </div>
  );
}