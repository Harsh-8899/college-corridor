"use client";

import { useMemo, useState } from "react";
import { 
  Search, 
  Download, 
  UserX, 
  UserCheck, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet,
  FileCode,
  Shield,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserRecord = {
  id: string;
  name: string | null;
  fullName: string | null;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  city: string | null;
  state: string | null;
  status: string;
  role: {
    name: string;
  } | null;
  createdAt: string;
};

type UsersManagerClientProps = {
  initialUsers: UserRecord[];
  availableRoles: string[];
  currentUserEmail: string;
};

export function UsersManagerClient({ initialUsers, availableRoles, currentUserEmail }: UsersManagerClientProps) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter users based on search and status
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 1. Search term match
      const searchLower = searchTerm.toLowerCase().trim();
      const nameMatch = user.name?.toLowerCase().includes(searchLower) || false;
      const fullNameMatch = user.fullName?.toLowerCase().includes(searchLower) || false;
      const emailMatch = user.email.toLowerCase().includes(searchLower);
      const phoneMatch = user.phone?.includes(searchLower) || false;
      const searchMatches = !searchLower || nameMatch || fullNameMatch || emailMatch || phoneMatch;

      // 2. Status match
      const statusMatches = selectedStatus === "ALL" || user.status === selectedStatus;

      return searchMatches && statusMatches;
    });
  }, [users, searchTerm, selectedStatus]);

  // Update user status
  async function handleStatusUpdate(userId: string, newStatus: string) {
    setUpdatingId(userId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Failed to update user status.");
        return;
      }

      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, status: newStatus } : u)
      );
      setSuccess(`User status updated to ${newStatus.toLowerCase().replace(/_/g, " ")} successfully.`);
    } catch {
      setError("Failed to update user. Server communication error.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Deactivate/Soft-delete user
  async function handleDeactivate(userId: string) {
    if (!confirm("Are you sure you want to deactivate and soft-delete this user account?")) {
      return;
    }

    setUpdatingId(userId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Failed to deactivate user.");
        return;
      }

      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, status: "DELETED" } : u)
      );
      setSuccess("User account deactivated successfully.");
    } catch {
      setError("Failed to deactivate user. Server communication error.");
    } finally {
      setUpdatingId(null);
    }
  }

  // CSV Exporter
  function exportCSV() {
    const headers = ["ID", "Name", "Full Name", "Email", "Phone", "Phone Verified", "City", "State", "Role", "Status", "Registered Date"];
    const rows = filteredUsers.map(u => [
      u.id,
      u.name || "",
      u.fullName || "",
      u.email,
      u.phone || "",
      u.phoneVerified ? "TRUE" : "FALSE",
      u.city || "",
      u.state || "",
      u.role?.name || "STUDENT",
      u.status,
      u.createdAt
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `college-corridor-users-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // JSON Exporter
  function exportJSON() {
    const jsonString = JSON.stringify(filteredUsers, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `college-corridor-users-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Get status badge classes
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "PENDING_VERIFICATION":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "SUSPENDED":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "BLOCKED":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      case "DELETED":
        return "bg-slate-50 text-slate-500 border-slate-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 text-sm font-medium text-rose-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 text-sm font-medium text-emerald-600">
          {success}
        </div>
      )}

      {/* Controls Card */}
      <Card className="border-slate-200/80 shadow-sm bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone number..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus-visible:ring-primary"
              />
            </div>

            {/* Exporters */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2 text-slate-700 border-slate-200 hover:bg-slate-50">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Export CSV
              </Button>
              <Button onClick={exportJSON} variant="outline" size="sm" className="gap-2 text-slate-700 border-slate-200 hover:bg-slate-50">
                <FileCode className="h-4 w-4 text-blue-600" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 mt-5 border-t pt-4">
            {["ALL", "ACTIVE", "PENDING_VERIFICATION", "SUSPENDED", "BLOCKED", "DELETED"].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-4 py-1 text-xs font-semibold border transition-all ${
                  selectedStatus === status
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                }`}
              >
                {status === "ALL" ? "All Users" : status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users List Grid */}
      <Card className="border-slate-200/80 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900">
            Records ({filteredUsers.length} of {users.length})
          </CardTitle>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">User Account</th>
                <th className="py-3.5 px-6">Contact / Location</th>
                <th className="py-3.5 px-6">Role & Status</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    No users found matching search terms.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isSelf = user.email === currentUserEmail;
                  const isRoleStudent = user.role?.name === "STUDENT";
                  
                  return (
                    <tr key={user.id} className={`hover:bg-slate-50/40 transition-colors ${isSelf ? "bg-slate-50/80" : ""}`}>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {user.fullName || user.name || "N/A"}
                          {isSelf && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{user.phone || "N/A"}</span>
                          {user.phone && (
                            user.phoneVerified ? (
                              <span title="Verified">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              </span>
                            ) : (
                              <span title="Unverified">
                                <XCircle className="h-3.5 w-3.5 text-slate-300" />
                              </span>
                            )
                          )}
                        </div>
                        {(user.city || user.state) && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{[user.city, user.state].filter(Boolean).join(", ")}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 space-y-1.5">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700">{user.role?.name || "STUDENT"}</span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center border rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(user.status)}`}>
                            {user.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {updatingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin inline-block text-slate-400" />
                        ) : isSelf ? (
                          <span className="text-slate-400 text-xs italic">Read-only</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {/* Suspend / Block status actions */}
                            {["ACTIVE", "PENDING_VERIFICATION"].includes(user.status) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(user.id, "SUSPENDED")}
                                  className="h-8 text-xs font-medium border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                >
                                  <UserX className="h-3.5 w-3.5 mr-1" />
                                  Suspend
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(user.id, "BLOCKED")}
                                  className="h-8 text-xs font-medium border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                                  Block
                                </Button>
                              </>
                            )}

                            {/* Unblock / Unsuspend action */}
                            {["SUSPENDED", "BLOCKED"].includes(user.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(user.id, "ACTIVE")}
                                className="h-8 text-xs font-medium border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                                Activate
                              </Button>
                            )}

                            {/* Deactivate Soft-Delete Button */}
                            {user.status !== "DELETED" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeactivate(user.id)}
                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="Deactivate Account"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
