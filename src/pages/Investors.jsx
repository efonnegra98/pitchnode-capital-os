import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import InvestorTable from "../components/investors/InvestorTable";
import InvestorModal from "../components/investors/InvestorModal";

export default function Investors() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [modalData, setModalData] = useState(null);

  const queryClient = useQueryClient();

  const { data: investors = [], isLoading } = useQuery({
    queryKey: ["investors"],
    queryFn: () => base44.entities.Investor.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      if (formData.id) {
        const { id, created_date, updated_date, created_by, ...rest } = formData;
        return base44.entities.Investor.update(id, rest);
      }
      return base44.entities.Investor.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      setModalData(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Investor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      setModalData(null);
    },
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedFiltered = useMemo(() => {
    let filtered = investors.filter((inv) => {
      const q = search.toLowerCase();
      return (
        inv.name?.toLowerCase().includes(q) ||
        inv.firm?.toLowerCase().includes(q) ||
        inv.status?.toLowerCase().includes(q)
      );
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [investors, search, sortField, sortDir]);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Investor Tracking</h1>
          <p className="text-muted-foreground text-sm mt-1">{investors.length} contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search investors..."
              className="pl-9 w-56"
            />
          </div>
          <button
            onClick={() => setModalData({})}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all whitespace-nowrap"
          >
            + Add Investor
          </button>
        </div>
      </div>

      {investors.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-slate-200">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">No Investors Yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Start building your investor pipeline by adding your first contact.
          </p>
          <button
            onClick={() => setModalData({})}
            className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-all"
          >
            Add First Investor
          </button>
        </div>
      ) : (
        <InvestorTable
          investors={sortedFiltered}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={(inv) => setModalData(inv)}
        />
      )}

      {modalData !== null && (
        <InvestorModal
          investor={modalData}
          onSave={(data) => saveMutation.mutate(data)}
          onDelete={(id) => deleteMutation.mutate(id)}
          onClose={() => setModalData(null)}
          isSaving={saveMutation.isPending}
        />
      )}
    </div>
  );
}