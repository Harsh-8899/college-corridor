"use client";

import { useState, useMemo } from "react";
import { UserPlus, Save, ArrowLeft, Loader2, Users, Trash2, Search, Filter, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  interestedCategory?: string;
  appliedCollege?: string;
  leadStatus?: string;
  assignedCounselor?: string;
  assignedLeadsCount?: number;
};

type UserFormProps = {
  onSaved: (user: User) => void;
  onCancel: () => void;
};

export function UserForm({ onSaved, onCancel }: UserFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.error?.message || "Failed to create user.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      onSaved(data.data);
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl font-bold text-slate-900">Create Internal User</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm font-medium text-rose-600 flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              {error}
            </div>
          )}
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Anand Kumar"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. anand@collegecorridor.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Security Role</Label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="STUDENT">Student</option>
                <option value="EDITOR">Editor (Manage Colleges)</option>
                <option value="COUNSELOR">Counselor (View Leads)</option>
                <option value="CRM">CRM Executive</option>
                <option value="FINANCE">Finance Executive</option>
                <option value="UNIVERSITY_PARTNER">University Partner</option>
                <option value="ADMIN">Admin (Full Access)</option>
                <option value="SUPER_ADMIN">Super Admin (System Owner)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function UserTable({
  initialUsers,
  currentUserRole = "ADMIN",
  currentUserEmail = ""
}: {
  initialUsers: User[];
  currentUserRole?: string;
  currentUserEmail?: string;
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"management" | "students">("management");
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Role Hierarchy Check helper
  function canDeactivate(targetUser: User) {
    if (targetUser.email === currentUserEmail) return false;
    if (!["SUPER_ADMIN", "ADMIN"].includes(currentUserRole)) return false;
    
    if (currentUserRole === "SUPER_ADMIN") {
      return true;
    }
    
    if (currentUserRole === "ADMIN") {
      return !["SUPER_ADMIN", "ADMIN"].includes(targetUser.role);
    }
    
    return false;
  }

  // Deactivate handler
  async function handleDeactivate(user: User) {
    if (!confirm(`Are you sure you want to deactivate ${user.name} (${user.role})? This will suspend their login credentials.`)) {
      return;
    }

    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: "DELETE"
      });

      const result = await res.json();
      if (!res.ok) {
        setActionError(result?.error?.message || `Failed to deactivate user ${user.name}.`);
        return;
      }

      // Remove from list or change status locally
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setActionSuccess(`Successfully deactivated and suspended user ${user.name}.`);
      
      // Auto dismiss success alert
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setActionError("A network error occurred while deactivating the user.");
    }
  }

  // Split and filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Tab Split
      const isStudent = u.role === "STUDENT";
      if (activeTab === "students" && !isStudent) return false;
      if (activeTab === "management" && isStudent) return false;

      // 2. Search query (matches Name, Email, Phone, Preferred Course, City, Counselor)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q)) ||
          (u.interestedCategory && u.interestedCategory.toLowerCase().includes(q)) ||
          (u.appliedCollege && u.appliedCollege.toLowerCase().includes(q)) ||
          (u.assignedCounselor && u.assignedCounselor.toLowerCase().includes(q));
        
        if (!matchesSearch) return false;
      }

      // 3. Role filter
      if (roleFilter && u.role !== roleFilter) return false;

      // 4. Status filter
      if (statusFilter && u.status !== statusFilter) return false;

      return true;
    });
  }, [users, activeTab, searchQuery, roleFilter, statusFilter]);

  // Count metrics for tabs badge
  const counts = useMemo(() => {
    return {
      management: users.filter((u) => u.role !== "STUDENT").length,
      students: users.filter((u) => u.role === "STUDENT").length
    };
  }, [users]);

  if (showForm) {
    return (
      <UserForm
        onSaved={(u) => {
          setUsers([u, ...users]);
          setShowForm(false);
          setActionSuccess(`User ${u.name} successfully created!`);
          setTimeout(() => setActionSuccess(""), 4000);
        }}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Notices */}
      {actionSuccess && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3.5 text-sm font-semibold text-emerald-600 flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm font-semibold text-rose-600 flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Main Header and Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Visual Tab Buttons */}
        <div className="flex rounded-lg bg-slate-100 p-1 border">
          <button
            onClick={() => {
              setActiveTab("management");
              setRoleFilter("");
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === "management"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4" />
            Management Users
            <span className="ml-1 rounded bg-slate-100 px-2 py-0.5 text-xxs font-bold text-slate-700 ring-1 ring-slate-200">
              {counts.management}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("students");
              setRoleFilter("");
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === "students"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4" />
            Students Database
            <span className="ml-1 rounded bg-slate-100 px-2 py-0.5 text-xxs font-bold text-slate-700 ring-1 ring-slate-200">
              {counts.students}
            </span>
          </button>
        </div>

        {/* Action Trigger */}
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Create User / Staff
        </Button>
      </div>

      {/* Search & Filter Grid */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 items-center">
        {/* Search Query */}
        <div className="relative col-span-1 sm:col-span-2 md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder={
              activeTab === "students" 
                ? "Search students by name, phone, course, category..." 
                : "Search staff by name, email, role..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        {/* Role Filter - Only relevant for Management tab */}
        {activeTab === "management" ? (
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-10 pl-9 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-slate-700"
            >
              <option value="">All Staff Roles</option>
              <option value="SUPER_ADMIN">Super Admins</option>
              <option value="ADMIN">Admins</option>
              <option value="COUNSELOR">Counselors</option>
              <option value="UNIVERSITY_PARTNER">Partners</option>
              <option value="EDITOR">Editors</option>
              <option value="CRM">CRM Executives</option>
              <option value="FINANCE">Finance</option>
            </select>
          </div>
        ) : (
          <div className="text-sm text-slate-500 font-semibold italic text-center sm:text-left self-center">
            Role: Registered Students
          </div>
        )}

        {/* Status Filter */}
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 pl-9 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INVITED">Invited</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Database Tables Card */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "management" ? (
            /* Management Users Table */
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-slate-600 text-left font-medium">
                <tr>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Assigned Leads</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                    <td className="p-4 text-slate-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold
                        ${user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 
                          user.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800' : 
                          user.role === 'COUNSELOR' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'CRM' ? 'bg-teal-100 text-teal-800' :
                          user.role === 'EDITOR' ? 'bg-blue-100 text-blue-800' : 
                          user.role === 'UNIVERSITY_PARTNER' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                        ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                          user.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 
                          'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        {user.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {user.assignedLeadsCount !== undefined ? user.assignedLeadsCount : "0"} leads
                    </td>
                    <td className="p-4 text-right">
                      {canDeactivate(user) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(user)}
                          className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 gap-1.5"
                          title="Deactivate Account"
                        >
                          <Trash2 className="h-4 w-4" />
                          Deactivate
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      No management users found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* Students Database Table */
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-slate-600 text-left font-medium">
                <tr>
                  <th className="p-4 font-bold">Student Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Phone</th>
                  <th className="p-4 font-bold">Vertical</th>
                  <th className="p-4 font-bold">Applied College</th>
                  <th className="p-4 font-bold">Lead Status</th>
                  <th className="p-4 font-bold">Assigned Counselor</th>
                  <th className="p-4 font-bold">Created At</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                    <td className="p-4 text-slate-600">{user.email}</td>
                    <td className="p-4 font-medium text-slate-700">{user.phone || "N/A"}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 capitalize">
                        {(user.interestedCategory || "N/A").toLowerCase().replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 max-w-[150px] truncate" title={user.appliedCollege || "N/A"}>
                      {user.appliedCollege || "N/A"}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-semibold capitalize">
                        {(user.leadStatus || "NEW").toLowerCase().replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700">{user.assignedCounselor || "Unassigned"}</td>
                    <td className="p-4 text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      {canDeactivate(user) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(user)}
                          className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 gap-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Deactivate
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400">
                      No student records found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
