import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Send } from "lucide-react";

function formatDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function AdminSupportNotes({ targetUserEmail, companyId, adminEmail }) {
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ["supportNotes", targetUserEmail],
    queryFn: () => base44.entities.SupportNote.filter({ target_user_email: targetUserEmail }),
    enabled: !!targetUserEmail,
  });

  const addNote = useMutation({
    mutationFn: (text) =>
      base44.entities.SupportNote.create({
        target_user_email: targetUserEmail,
        target_company_id: companyId,
        note: text,
        admin_email: adminEmail,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportNotes", targetUserEmail] });
      setNote("");
    },
  });

  const sorted = [...notes].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Support Notes</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a support note..."
          rows={2}
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 resize-none focus:outline-none focus:border-violet-400"
        />
        <button
          disabled={!note.trim() || addNote.isPending}
          onClick={() => addNote.mutate(note.trim())}
          className="self-end px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-56 overflow-y-auto">
        {sorted.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-3">No notes yet</p>
        )}
        {sorted.map(n => (
          <div key={n.id} className="bg-slate-50 rounded-lg px-3 py-2.5">
            <p className="text-xs text-slate-700">{n.note}</p>
            <p className="text-[10px] text-slate-400 mt-1">{n.admin_email} · {formatDateTime(n.created_date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}