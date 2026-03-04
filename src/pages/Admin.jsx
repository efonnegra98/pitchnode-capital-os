import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Shield, Users } from "lucide-react";
import AdminUserTable from "../components/admin/AdminUserTable";
import AdminUserDetail from "../components/admin/AdminUserDetail";

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Trial Active", value: "trial_active" },
  { label: "Trial Expired", value: "trial_expired" },
  { label: "Paid Active", value: "paid" },
];

export default function Admin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [accessChecked, setAccessChecked] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  // Redirect non-admins
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role !== "admin") {
        navigate("/");
      } else {
        setAccessChecked(true);
      }
    }
  }, [currentUser, navigate]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["adminAllUsers"],
    queryFn: async () => {
      const res = await base44.functions.invoke("adminGetAllUsers", {});
      return res.data?.users || [];
    },
    enabled: accessChecked,
  });

  const users = usersData || [];

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.user_email?.toLowerCase().includes(q) ||
      u.founder_name?.toLowerCase().includes(q) ||
      u.company_name?.toLowerCase().includes(q);

    const matchFilter =
      filter === "all" ||
      (filter === "trial_active" && u.trial_active && u.subscription_status !== "active") ||
      (filter === "trial_expired" && !u.trial_active && u.subscription_status !== "active") ||
      (filter === "paid" && u.subscription_status === "active");

    return matchSearch && matchFilter;
  });

  if (!accessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Checking access...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Console</h1>
          <p className="text-slate-400 text-sm">Internal user management and support</p>
        </div>
      </div>

      {selectedUser ? (
        <AdminUserDetail
          userData={selectedUser}
          adminUser={currentUser}
          onBack={() => setSelectedUser(null)}
        />
      ) : (
        <>
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Users", value: users.length },
              { label: "Trial Active", value: users.filter(u => u.trial_active && u.subscription_status !== "active").length },
              { label: "Trial Expired", value: users.filter(u => !u.trial_active && u.subscription_status !== "active").length },
              { label: "Paid", value: users.filter(u => u.subscription_status === "active").length },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    filter === opt.value
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
            </div>
          ) : (
            <AdminUserTable users={filtered} onView={setSelectedUser} />
          )}
        </>
      )}
    </div>
  );
}