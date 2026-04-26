import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Linkedin } from "lucide-react";

const STAGES = [
  "Identified",
  "Contacted",
  "Intro Call",
  "Partner Meeting",
  "Due Diligence",
  "Soft Commit",
  "Hard Commit",
];

const statusColors = {
  Warm: "bg-amber-50 text-amber-700 border-amber-200",
  Engaged: "bg-blue-50 text-blue-700 border-blue-200",
  Passed: "bg-slate-100 text-slate-500 border-slate-200",
  Committed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const sentimentColors = {
  Champion: "text-emerald-600",
  Positive: "text-blue-500",
  Curious: "text-amber-500",
  Neutral: "text-slate-400",
  Skeptical: "text-red-400",
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

function getAvatarColor(name) {
  const str = name || "?";
  return avatarColors[str.charCodeAt(0) % avatarColors.length];
}

function getInitials(name, firm) {
  if (name?.trim()) return name.trim()[0].toUpperCase();
  if (firm?.trim()) return firm.trim()[0].toUpperCase();
  return "?";
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function InvestorCard({ inv, index, onEdit }) {
  return (
    <Draggable draggableId={inv.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(inv)}
          className={`bg-white rounded-xl border border-slate-200 p-3.5 cursor-pointer transition-shadow select-none
            ${snapshot.isDragging ? "shadow-lg ring-2 ring-violet-300 rotate-1" : "hover:shadow-md"}`}
        >
          {/* Avatar + Name */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold ${getAvatarColor(inv.name || inv.firm)}`}>
              {getInitials(inv.name, inv.firm)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{inv.name || <span className="italic text-slate-400">No name</span>}</p>
                {inv.linkedin_url && (
                  <a
                    href={inv.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 text-[#0077B5] hover:text-[#005885]"
                  >
                    <Linkedin className="w-3 h-3" />
                  </a>
                )}
              </div>
              {inv.firm && <p className="text-[11px] text-slate-400 truncate">{inv.firm}</p>}
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {inv.status && (
              <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${statusColors[inv.status] || ""}`}>
                {inv.status}
              </span>
            )}
            {inv.sentiment && (
              <span className={`text-[11px] font-medium ${sentimentColors[inv.sentiment] || "text-slate-400"}`}>
                {inv.sentiment}
              </span>
            )}
          </div>

          {/* Next action date */}
          {inv.next_action_date && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
              Next: <span className="font-medium text-slate-700">{formatDate(inv.next_action_date)}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

function StageColumn({ stage, investors, onEdit }) {
  return (
    <div className="flex flex-col min-w-[220px] w-[220px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{stage}</h3>
        <span className="text-[11px] text-slate-400 font-medium bg-slate-100 rounded-full px-2 py-0.5">
          {investors.length}
        </span>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[120px] rounded-xl p-2 space-y-2 transition-colors
              ${snapshot.isDraggingOver ? "bg-violet-50 ring-1 ring-violet-200" : "bg-slate-50"}`}
          >
            {investors.map((inv, index) => (
              <InvestorCard key={inv.id} inv={inv} index={index} onEdit={onEdit} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function InvestorBoard({ investors, onEdit, onStageChange }) {
  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = investors.filter((inv) => inv.funnel_stage === stage);
    return acc;
  }, {});

  // Investors with no stage go into "Identified"
  const unassigned = investors.filter((inv) => !inv.funnel_stage || !STAGES.includes(inv.funnel_stage));
  grouped["Identified"] = [...(grouped["Identified"] || []), ...unassigned];

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    onStageChange(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
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