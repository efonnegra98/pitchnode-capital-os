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
      action: "Make first contact",
      reason: sentiment === "Champion" ? "Strong signal — reach out now" : "Investor not yet contacted",
      urgency: sentiment === "Champion" ? "high" : "medium",
    };
  }

  if (funnel_stage === "Contacted") {
    if (daysSince !== null && daysSince >= 7) {
      return {
        action: "Send a follow-up email",
        reason: `Last contact ${daysStr} — time to check in`,
        urgency: daysSince >= 14 ? "high" : "medium",
      };
    }
    return {
      action: "Schedule an intro call",
      reason: "Move the conversation to a meeting",
      urgency: "medium",
    };
  }

  if (funnel_stage === "Intro Call") {
    if (sentiment === "Positive" || sentiment === "Champion") {
      return {
        action: "Schedule a partner meeting",
        reason: "Positive sentiment — strike while it's hot",
        urgency: "high",
      };
    }
    if (objections.length > 0) {
      return {
        action: `Address ${objections[0]} concerns`,
        reason: "Send targeted materials to overcome objection",
        urgency: "medium",
      };
    }
    return {
      action: "Send follow-up materials",
      reason: daysStr ? `Last contact ${daysStr}` : "Keep momentum after intro call",
      urgency: "medium",
    };
  }

  if (funnel_stage === "Partner Meeting") {
    if (sentiment === "Positive" || sentiment === "Champion") {
      return {
        action: "Share data room access",
        reason: "High interest — give them full diligence materials",
        urgency: "high",
      };
    }
    return {
      action: "Send a soft-commit ask",
      reason: daysStr ? `Meeting was ${daysStr} — time to ask` : "Follow up after partner meeting",
      urgency: "medium",
    };
  }

  if (funnel_stage === "Due Diligence") {
    return {
      action: "Check in on diligence progress",
      reason: daysStr ? `Last contact ${daysStr}` : "Keep diligence on track",
      urgency: daysSince !== null && daysSince >= 7 ? "high" : "medium",
    };
  }

  if (funnel_stage === "Soft Commit") {
    return {
      action: "Move to term sheet review",
      reason: "Soft commit in place — push for hard commit",
      urgency: "high",
    };
  }

  if (funnel_stage === "Hard Commit") {
    return {
      action: "Confirm wire details & close",
      reason: "Hard commit secured — finalize the investment",
      urgency: "high",
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