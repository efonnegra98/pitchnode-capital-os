/**
 * Raise Signals Engine
 * Scans all capital OS modules and returns structured signals.
 * Each signal has: id, severity ("priority" | "attention" | "info"), module, message, detail?
 */

export function computeRaiseSignals({ company, investors = [], updates = [], readinessItems = [] }) {
  const signals = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const daysSince = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return Math.floor((now - d) / (1000 * 60 * 60 * 24));
  };

  // ─── ROUND OVERVIEW ───────────────────────────────────────────────────────
  if (company?.raise_mode) {
    const target = company.target_raise_amount || 0;
    const committed = company.capital_committed || 0;
    const soft = company.soft_commitments || 0;

    if (target > 0) {
      const progressPct = (committed / target) * 100;

      if (progressPct === 0) {
        signals.push({
          id: "no-commitments",
          severity: "priority",
          module: "Round Overview",
          message: "No capital has been committed to the round yet.",
          detail: "Log your first commitment to start tracking round progress.",
        });
      } else if (progressPct < 25) {
        signals.push({
          id: "low-commitments",
          severity: "attention",
          module: "Round Overview",
          message: `Round is ${progressPct.toFixed(0)}% committed — below 25% threshold.`,
          detail: "Focus on converting warm leads to firm commitments.",
        });
      }

      // Check for recent commitment activity
      const committedInvestors = investors.filter(i => i.status === "Committed");
      if (committedInvestors.length > 0) {
        const mostRecentCommit = committedInvestors
          .filter(i => i.last_contact_date)
          .sort((a, b) => new Date(b.last_contact_date) - new Date(a.last_contact_date))[0];
        const days = mostRecentCommit ? daysSince(mostRecentCommit.last_contact_date) : null;
        if (days !== null && days > 12) {
          signals.push({
            id: "stale-commitments",
            severity: "attention",
            module: "Round Overview",
            message: `No new commitments have been logged in ${days} days.`,
            detail: "Re-engage warm investors to maintain momentum.",
          });
        }
      }

      if (company.target_close_date) {
        const closeDate = new Date(company.target_close_date);
        const daysToClose = Math.floor((closeDate - now) / (1000 * 60 * 60 * 24));
        if (daysToClose < 30 && daysToClose >= 0 && progressPct < 75) {
          signals.push({
            id: "close-date-risk",
            severity: "priority",
            module: "Round Overview",
            message: `Target close is in ${daysToClose} days with only ${progressPct.toFixed(0)}% committed.`,
            detail: "Accelerate outreach to hit close date targets.",
          });
        }
      }
    }
  }

  // ─── FINANCIAL METRICS ────────────────────────────────────────────────────
  const sentUpdates = updates.filter(u => u.status === "sent" && u.sent_date)
    .sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date));

  const lastSent = sentUpdates[0];
  const daysSinceUpdate = lastSent ? daysSince(lastSent.sent_date) : null;

  if (updates.length === 0) {
    signals.push({
      id: "no-updates",
      severity: "attention",
      module: "Financial Metrics",
      message: "No investor updates have been created yet.",
      detail: "Regular updates build investor trust and signal operational discipline.",
    });
  } else if (daysSinceUpdate === null) {
    signals.push({
      id: "no-sent-updates",
      severity: "attention",
      module: "Financial Metrics",
      message: "No investor update has been sent yet.",
      detail: "Draft updates exist but none have been sent to investors.",
    });
  } else if (daysSinceUpdate > 45) {
    signals.push({
      id: "overdue-update",
      severity: "priority",
      module: "Financial Metrics",
      message: `No investor update has been sent in ${daysSinceUpdate} days.`,
      detail: "Monthly updates are expected by institutional investors. Send one now.",
    });
  } else if (daysSinceUpdate > 30) {
    signals.push({
      id: "late-update",
      severity: "attention",
      module: "Financial Metrics",
      message: `Last investor update was sent ${daysSinceUpdate} days ago.`,
      detail: "Consider sending a fresh update to keep investors informed.",
    });
  }

  // Check for financial model in readiness items
  const financialModel = readinessItems.find(i =>
    i.item_name?.toLowerCase().includes("financial model")
  );
  if (financialModel && financialModel.status !== "Complete") {
    const daysSinceModelUpdate = financialModel.updated_date ? daysSince(financialModel.updated_date) : null;
    if (daysSinceModelUpdate === null || daysSinceModelUpdate > 30) {
      signals.push({
        id: "financial-model-stale",
        severity: "attention",
        module: "Financial Metrics",
        message: "Financial model has not been updated recently.",
        detail: "Investors expect a current model during due diligence.",
      });
    }
  }

  // ─── FUNNEL ANALYTICS ─────────────────────────────────────────────────────
  if (investors.length > 0) {
    const active = investors.filter(i => i.status !== "Passed" && i.cadence_status !== "Closed");
    const passed = investors.filter(i => i.status === "Passed");
    const committed = investors.filter(i => i.status === "Committed");
    const engaged = investors.filter(i => i.status === "Engaged");
    const warm = investors.filter(i => i.status === "Warm");
    const partnerMeeting = investors.filter(i => i.funnel_stage === "Partner Meeting");
    const introCalls = investors.filter(i => i.funnel_stage === "Intro Call");

    // Stale investors
    const staleInvestors = active.filter(i => {
      const days = daysSince(i.last_contact_date);
      return days === null || days >= 21;
    });
    if (staleInvestors.length >= 3) {
      signals.push({
        id: "stale-investors",
        severity: "priority",
        module: "Funnel Analytics",
        message: `${staleInvestors.length} active investors have not been contacted in 21+ days.`,
        detail: "Re-engage stale contacts to maintain pipeline momentum.",
      });
    } else if (staleInvestors.length > 0) {
      signals.push({
        id: "some-stale-investors",
        severity: "attention",
        module: "Funnel Analytics",
        message: `${staleInvestors.length} investor${staleInvestors.length > 1 ? "s are" : " is"} overdue for follow-up (21+ days).`,
        detail: staleInvestors.map(i => i.name || i.firm || "Unnamed").join(", "),
      });
    }

    // Overdue follow-ups
    const overdueFollowUps = active.filter(i => {
      if (!i.next_action_date) return false;
      return daysSince(i.next_action_date) > 0;
    });
    if (overdueFollowUps.length > 0) {
      signals.push({
        id: "overdue-followups",
        severity: overdueFollowUps.length >= 3 ? "priority" : "attention",
        module: "Funnel Analytics",
        message: `${overdueFollowUps.length} scheduled follow-up${overdueFollowUps.length > 1 ? "s are" : " is"} overdue.`,
        detail: overdueFollowUps.map(i => i.name || i.firm || "Unnamed").slice(0, 3).join(", ") + (overdueFollowUps.length > 3 ? ` +${overdueFollowUps.length - 3} more` : ""),
      });
    }

    // Strong conversion signal
    if (partnerMeeting.length >= 2 && warm.length >= 3) {
      signals.push({
        id: "strong-conversion",
        severity: "info",
        module: "Funnel Analytics",
        message: "Partner meeting conversion is strong — prioritize warm introductions.",
        detail: `${partnerMeeting.length} investors are at Partner Meeting stage.`,
      });
    }

    // High pass rate warning
    if (passed.length > 0 && investors.length > 0) {
      const passRate = (passed.length / investors.length) * 100;
      if (passRate > 50) {
        signals.push({
          id: "high-pass-rate",
          severity: "attention",
          module: "Funnel Analytics",
          message: `${passRate.toFixed(0)}% pass rate detected across tracked investors.`,
          detail: "Review messaging, positioning, or investor-stage fit.",
        });
      }
    }

    // No engaged investors
    if (engaged.length === 0 && active.length >= 3) {
      signals.push({
        id: "no-engaged",
        severity: "attention",
        module: "Funnel Analytics",
        message: "No investors are currently marked as Engaged.",
        detail: "Move qualified warm contacts to Engaged to track active diligence.",
      });
    }
  }

  // ─── RAISE READINESS ──────────────────────────────────────────────────────
  if (readinessItems.length > 0) {
    const completeCount = readinessItems.filter(i => i.status === "Complete").length;
    const readinessScore = Math.round((completeCount / readinessItems.length) * 100);

    if (readinessScore < 50) {
      signals.push({
        id: "low-readiness",
        severity: "priority",
        module: "Raise Readiness",
        message: `Readiness score is ${readinessScore}% — below the 50% minimum threshold.`,
        detail: "Complete critical items before initiating formal investor conversations.",
      });
    } else if (readinessScore < 70) {
      signals.push({
        id: "medium-readiness",
        severity: "attention",
        module: "Raise Readiness",
        message: `Readiness score is ${readinessScore}% — below the 70% recommended level.`,
      });
    }

    // Specific incomplete critical items
    const criticalIncomplete = readinessItems.filter(i =>
      i.status !== "Complete" &&
      ["Cap Table Clean", "Customer References Ready", "Pitch Deck Finalized", "Legal Structure Verified"].includes(i.item_name)
    );
    if (criticalIncomplete.length > 0) {
      signals.push({
        id: "critical-items-incomplete",
        severity: readinessScore < 60 ? "priority" : "attention",
        module: "Raise Readiness",
        message: `Critical items incomplete: ${criticalIncomplete.map(i => i.item_name).join(", ")}.`,
        detail: "These items are typically required before institutional investor meetings.",
      });
    }

    // Data room check
    const dataRoom = readinessItems.find(i => i.item_name?.toLowerCase().includes("data room"));
    if (dataRoom && dataRoom.status !== "Complete") {
      signals.push({
        id: "data-room-incomplete",
        severity: "attention",
        module: "Data Room",
        message: "Data room is not yet organized.",
        detail: "Investors request data room access before advancing to Due Diligence.",
      });
    }

    // Items with no file uploaded and in data room context
    const noFileItems = readinessItems.filter(i => !i.file_url && i.status === "Complete");
    // Only surface if some are complete but have no documentation
    // This is an "info" level signal
    const itemsWithFile = readinessItems.filter(i => i.file_url).length;
    if (itemsWithFile === 0 && completeCount > 0) {
      signals.push({
        id: "no-documents-uploaded",
        severity: "info",
        module: "Data Room",
        message: "No supporting documents have been uploaded to the data room.",
        detail: "Upload your pitch deck, financial model, and cap table to strengthen your data room.",
      });
    }
  }

  // Sort: priority first, then attention, then info
  const order = { priority: 0, attention: 1, info: 2 };
  return signals.sort((a, b) => order[a.severity] - order[b.severity]);
}

/**
 * Get signals for a specific module only
 */
export function getModuleSignals(signals, moduleName) {
  return signals.filter(s => s.module === moduleName);
}