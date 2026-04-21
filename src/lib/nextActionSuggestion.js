/**
 * Derives a context-aware Next Action Type suggestion based on
 * Funnel Stage, Investor Sentiment, Objections, and Cadence Status.
 */
export function suggestNextActionType(investor) {
  const { sentiment, funnel_stage, objections = [], cadence_status, last_contact_date } = investor;

  // 1. Positive + Intro Call → Schedule Partner Meeting
  if (sentiment === "Positive" && funnel_stage === "Intro Call") {
    return "Schedule Meeting";
  }

  // 2. Positive + Partner Meeting → Send Soft Commit Ask (mapped to Send Materials as closest enum)
  if (sentiment === "Positive" && funnel_stage === "Partner Meeting") {
    return "Send Materials";
  }

  // 3. Curious + any objection present → Address objection materials
  if (sentiment === "Curious" && objections.length > 0) {
    return "Send Materials";
  }

  // 4. Neutral + Contacted → Re-engage
  if (sentiment === "Neutral" && funnel_stage === "Contacted") {
    return "Follow-up Email";
  }

  // 5. Skeptical → Pause / revisit
  if (sentiment === "Skeptical") {
    return "Waiting on Response";
  }

  // 6. Waiting cadence + last contact > 7 days ago
  if (cadence_status === "Waiting" && last_contact_date) {
    const daysSince = Math.floor(
      (new Date() - new Date(last_contact_date)) / (1000 * 60 * 60 * 24)
    );
    if (daysSince > 7) {
      return "Follow-up Email";
    }
  }

  // Default
  return "Send Materials";
}

/**
 * Returns a human-readable label for display in the list view.
 */
export function suggestNextActionLabel(investor) {
  const { sentiment, funnel_stage, objections = [], cadence_status, last_contact_date } = investor;

  if (sentiment === "Positive" && funnel_stage === "Intro Call") {
    return "Schedule Partner Meeting";
  }

  if (sentiment === "Positive" && funnel_stage === "Partner Meeting") {
    return "Send Soft Commit Ask";
  }

  if (sentiment === "Curious" && objections.length > 0) {
    const first = objections[0];
    return `Address ${first} — Send Targeted Materials`;
  }

  if (sentiment === "Neutral" && funnel_stage === "Contacted") {
    return "Re-engage — Send Company Update";
  }

  if (sentiment === "Skeptical") {
    return "Pause Outreach — Revisit in 30 Days";
  }

  if (cadence_status === "Waiting" && last_contact_date) {
    const daysSince = Math.floor(
      (new Date() - new Date(last_contact_date)) / (1000 * 60 * 60 * 24)
    );
    if (daysSince > 7) {
      return "Follow Up — Check In";
    }
  }

  return "Send Materials";
}