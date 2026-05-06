import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Globe, Linkedin } from "lucide-react";
import SmartNextAction from "./SmartNextAction";

export const FUNNEL_STAGES = [
  "Identified",
  "Researching",
  "Outreach Sent",
  "Intro Call Scheduled",
  "Intro Call Complete",
  "Interest Confirmed",
  "Diligence",
  "Term Sheet",
  "Closed Won",
  "Closed Lost",
  "Pass",
];

// Visual config per stage
const stageConfig = {
  "Identified":           { color: "bg-slate-100 dark:bg-[#1f1f1f]",    dot: "bg-slate-400",    header: "text-slate-600 dark:text-slate-400"  },
  "Researching":          { color: "bg-blue-50 dark:bg-blue-950/20",     dot: "bg-blue-400",     header: "text-blue-700 dark:text-blue-400"    },
  "Outreach Sent":        { color: "bg-indigo-50 dark:bg-indigo-950/20", dot: "bg-indigo-400",   header: "text-indigo-700 dark:text-indigo-400"},
  "Intro Call Scheduled": { color: "bg-violet-50 dark:bg-violet-950/20", dot: "bg-violet-400",   header: "text-violet-700 dark:text-violet-400"},
  "Intro Call Complete":  { color: "bg-purple-50 dark:bg-purple-950/20", dot: "bg-purple-400",   header: "text-purple-700 dark:text-purple-400"},
  "Interest Confirmed":   { color: "bg-amber-50 dark:bg-amber-950/20",   dot: "bg-amber-400",    header: "text-amber-700 dark:text-amber-400"  },
  "Diligence":            { color: "bg-orange-50 dark:bg-orange-950/20", dot: "bg-orange-400",   header: "text-orange-700 dark:text-orange-400"},
  "Term Sheet":           { color: "bg-emerald-50 dark:bg-emerald-950/20", dot: "bg-emerald-400", header: "text-emerald-700 dark:text-emerald-400"},
  "Closed Won":           { color: "bg-green-50 dark:bg-green-950/20",   dot: "bg-green-500",    header: "text-green-700 dark:text-green-400"  },
  "Closed Lost":          { color: "bg-red-50 dark:bg-red-950/20",       dot: "bg-red-400",      header: "text-red-600 dark:text-red-400"      },
  "Pass":                 { color: "bg-slate-50 dark:bg-[#1a1a1a]",      dot: "bg-slate-300",    header: "text-slate-500 dark:text-slate-400"  },
};

const statusColors = {
  Warm:      "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Engaged:   "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Passed:    "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  Committed: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
};

const firmTypeShort = {
  "Venture Capital":       "VC",
  "Angel":                 "Angel",
  "Family Office":         "FO",
  "Corporate / Strategic": "Corp",
  "Accelerator":           "Accel",
  "Private Equity":        "PE",
  "Other":                 "Other",
};

const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

function getAvatarColor(str) {
  const s = str || "?";
  return avatarColors[s.charCodeAt(0) % avatarColors.length];
}

function getInitials(firm, name) {
  if (firm?.trim()) return firm.trim()[0].toUpperCase();
  if (name?.trim()) return name.trim()[0].toUpperCase();
  return "?";
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function FirmCard({ inv, index, onEdit }) {
  const cfg = stageConfig[inv.funnel_stage] || stageConfig["Identified"];

  return (
    <Draggable draggableId={inv.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(inv)}
          className={`bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2a2a2a] p-3.5 cursor-pointer transition-shadow select-none
            ${snapshot.isDragging ? "shadow-lg ring-2 ring-violet-300 dark:ring-violet-600 rotate-1" : "hover:shadow-md"}`}
        >
          {/* Avatar + Firm Name */}
          <div className="flex items-start gap-2.5 mb-2.5">
            <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${getAvatarColor(inv.firm || inv.name)}`}>
              {getInitials(inv.firm, inv.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{inv.firm || <span className="italic text-slate-400 dark:text-[#888888]">No firm</span>}</p>
                {inv.website_url && (
                  <a href={inv.website_url} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600">
                    <Globe className="w-3 h-3" />
                  </a>
                )}
                {inv.linkedin_url && (
                  <a href={inv.linkedin_url} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 text-[#0077B5] hover:text-[#005885]">
                    <Linkedin className="w-3 h-3" />
                  </a>
                )}
              </div>
              {inv.name && <p className="text-[11px] text-slate-400 dark:text-[#888888] truncate">{inv.name}</p>}
            </div>
          </div>

          {/* Firm type + stage focus + check size */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {inv.firm_type && (
              <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                {firmTypeShort[inv.firm_type] || inv.firm_type}
              </span>
            )}
            {inv.stage_focus && (
              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium bg-violet-50 dark:bg-violet-950/30 px-1.5 py-0.5 rounded">
                {inv.stage_focus}
              </span>
            )}
            {inv.check_size && (
              <span className="text-[10px] text-slate-500 dark:text-[#888888]">{inv.check_size}</span>
            )}
          </div>

          {/* Status badge + portfolio count */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            {inv.status && (
              <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${statusColors[inv.status] || ""}`}>
                {inv.status}
              </span>
            )}
            {inv.portfolio_count ? (
              <span className="text-[10px] text-slate-400 dark:text-[#888888]">{inv.portfolio_count} cos</span>
            ) : null}
          </div>

          {/* Smart next action */}
          <SmartNextAction investor={inv} variant="inline" />

          {/* Next action date */}
          {inv.next_action_date && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#2a2a2a] text-[11px] text-slate-500 dark:text-[#888888]">
              Next: <span className="font-medium text-slate-700 dark:text-white">{formatDate(inv.next_action_date)}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

function StageColumn({ stage, investors, onEdit }) {
  const cfg = stageConfig[stage] || stageConfig["Identified"];

  return (
    <div className="flex flex-col min-w-[210px] w-[210px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <h3 className={`text-[11px] font-bold uppercase tracking-wider ${cfg.header}`}>{stage}</h3>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-[#888888] font-medium bg-slate-100 dark:bg-[#2a2a2a] rounded-full px-2 py-0.5">
          {investors.length}
        </span>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[100px] rounded-xl p-2 space-y-2 transition-colors
              ${snapshot.isDraggingOver ? "bg-violet-50 dark:bg-violet-950/30 ring-1 ring-violet-200 dark:ring-violet-700" : cfg.color}`}
          >
            {investors.map((inv, index) => (
              <FirmCard key={inv.id} inv={inv} index={index} onEdit={onEdit} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function InvestorBoard({ investors, onEdit, onStageChange }) {
  const grouped = FUNNEL_STAGES.reduce((acc, stage) => {
    acc[stage] = investors.filter((inv) => inv.funnel_stage === stage);
    return acc;
  }, {});

  // Legacy stage values → bucket into "Identified"
  const unassigned = investors.filter((inv) => !inv.funnel_stage || !FUNNEL_STAGES.includes(inv.funnel_stage));
  grouped["Identified"] = [...(grouped["Identified"] || []), ...unassigned];

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    onStageChange(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {FUNNEL_STAGES.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            investors={grouped[stage] || []}
            onEdit={onEdit}
          />
        ))}
      </div>
    </DragDropContext>
  );
}