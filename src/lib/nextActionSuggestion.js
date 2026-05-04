/**
 * Returns a rich smart-suggestion object:
 * { action: string, reason: string, urgency: "high"|"medium"|"low" }
 */
export function getSmartNextAction(investor) {
  const {
    sentiment,
    funnel_stage,
    objections = [],
    cadence_status,
    last_contact_date,
    status,
    next_action_type,
  } = investor;

  const daysSince = last_contact_date
    ? Math.floor((new Date() - new Date(last_contact_date)) / (1000 * 60 * 60 * 24))
    : null;

  const daysStr = daysSince !== null
    ? daysSince === 0 ? "today"
    : daysSince === 1 ? "yesterday"
    : `${daysSince} days ago`
    : null;

  // ── High-priority overrides ──────────────────────────────────────────────

  // Stale + was engaged
  if (daysSince !== null && daysSince >= 21 && funnel_stage && funnel_stage !== "Identified") {
    return {
      action: "Send a re-engagement email",
      reason: `No contact in ${daysSince} days — relationship at risk`,
      urgency: "high",
    };
  }

  // Overdue cadence
  if (cadence_status === "Overdue") {
    return {
      action: "Follow up immediately",
      reason: daysStr ? `Last contact ${daysStr} — cadence is overdue` : "Follow-up cadence is overdue",
      urgency: "high",
    };
  }

  // ── Pipeline-stage logic ─────────────────────────────────────────────────

  if (funnel_stage === "Identified") {
    return {
      action: "Start researching this firm",
      reason: "Review thesis fit before making contact",
      urgency: "low",
    };
  }

  if (funnel_stage === "Researching") {
    return {
      action: "Send initial outreach",
      reason: "Research complete — time to make first contact",
      urgency: "medium",
    };
  }

  if (funnel_stage === "Outreach Sent") {
    if (daysSince !== null && daysSince >= 7) {
      return {
        action: "Send a follow-up email",
        reason: `Outreach sent ${daysStr} with no response`,
        urgency: daysSince >= 14 ? "high" : "medium",
      };
    }
    return {
      action: "Await response & follow up if needed",
      reason: "Outreach sent — give it a few days",
      urgency: "low",
    };
  }

  if (funnel_stage === "Intro Call Scheduled") {
    return {
      action: "Prepare for intro call",
      reason: "Review investor thesis and prepare talking points",
      urgency: "high",
    };
  }

  if (funnel_stage === "Intro Call Complete") {
    if (sentiment === "Positive" || sentiment === "Champion") {
      return {
        action: "Send a follow-up recap & next steps",
        reason: daysStr ? `Call was ${daysStr} — strong interest, move fast` : "Great call — follow up promptly",
        urgency: "high",
      };
    }
    if (objections.length > 0) {
      return {
        action: `Address ${objections[0]} concern`,
        reason: "Send targeted materials to overcome objection",
        urgency: "medium",
      };
    }
    return {
      action: "Send follow-up and gauge interest",
      reason: daysStr ? `Call was ${daysStr}` : "Follow up after intro call",
      urgency: "medium",
    };
  }

  if (funnel_stage === "Interest Confirmed") {
    return {
      action: "Share data room access",
      reason: "Interest confirmed — give them full diligence materials",
      urgency: "high",
    };
  }

  if (funnel_stage === "Diligence") {
    return {
      action: "Check in on diligence progress",
      reason: daysStr ? `Last contact ${daysStr}` : "Keep diligence moving forward",
      urgency: daysSince !== null && daysSince >= 7 ? "high" : "medium",
    };
  }

  if (funnel_stage === "Term Sheet") {
    return {
      action: "Review and negotiate term sheet",
      reason: "Term sheet received — move quickly to close",
      urgency: "high",
    };
  }

  if (funnel_stage === "Closed Won") {
    return {
      action: "Confirm wire details & close",
      reason: "Investment secured — finalize paperwork",
      urgency: "high",
    };
  }

  if (funnel_stage === "Closed Lost") {
    return {
      action: "Send a gracious closing note",
      reason: "Keep the relationship warm for future rounds",
      urgency: "low",
    };
  }

  if (funnel_stage === "Pass") {
    return {
      action: "Archive and revisit in next round",
      reason: "Passed on this round — stay on their radar",
      urgency: "low",
    };
  }

  // ── Sentiment fallbacks ──────────────────────────────────────────────────

  if (sentiment === "Skeptical") {
    return {
      action: "Pause outreach for now",
      reason: "Skeptical sentiment — give space, revisit in 30 days",
      urgency: "low",
    };
  }

  if (sentiment === "Curious" && objections.length > 0) {
    return {
      action: `Send materials addressing ${objections[0]}`,
      reason: "Curious but has concerns — address them proactively",
      urgency: "medium",
    };
  }

  // ── Generic recency fallback ─────────────────────────────────────────────

  if (daysSince !== null && daysSince >= 7) {
    return {
      action: "Send a follow-up email",
      reason: `Last contact ${daysStr}`,
      urgency: daysSince >= 14 ? "high" : "medium",
    };
  }

  return {
    action: "Keep nurturing the relationship",
    reason: "Stay top of mind with regular touchpoints",
    urgency: "low",
  };
}

// Legacy helpers kept for backward compatibility
export function suggestNextActionType(investor) {
  const s = getSmartNextAction(investor);
  if (s.action.toLowerCase().includes("meeting") || s.action.toLowerCase().includes("call")) return "Schedule Meeting";
  if (s.action.toLowerCase().includes("data room") || s.action.toLowerCase().includes("materials")) return "Send Materials";
  if (s.action.toLowerCase().includes("term sheet")) return "Term Sheet Review";
  if (s.action.toLowerCase().includes("data room access")) return "Data Room Access";
  return "Follow-up Email";
}

export function suggestNextActionLabel(investor) {
  const { action, reason } = getSmartNextAction(investor);
  return `${action} — ${reason}`;
}