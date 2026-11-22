"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle, XCircle, ShieldCheck, Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApproveToggle = async (userId, currentStatus) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !currentStatus }),
    });
    if (res.ok) {
      fetchUsers();
      toast.success(currentStatus ? "User access revoked" : "User approved successfully");
    } else {
      toast.error("Could not update user approval");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      fetchUsers();
      toast.success(`User role changed to ${newRole.replace("_", " ")}`);
    } else {
      toast.error("Could not update user role");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to remove ${userName}?`)) return;
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      fetchUsers();
      toast.success(`${userName} was removed`);
    } else {
      toast.error(data.message || "Could not remove user");
    }
  };

  const pendingCount = users.filter((u) => !u.isApproved).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-indigo-600" /> User Management
            </h1>
            <p className="text-sm text-slate-500">Approve new registrations and manage system access roles.</p>
          </div>

          {pendingCount > 0 && (
            <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-xl text-sm font-semibold">
              {pendingCount} Pending Approval Request{pendingCount > 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading users...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {users.map((u) => (
                  <tr key={u._id} className={!u.isApproved ? "bg-amber-50/40" : "hover:bg-slate-50"}>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.department || "General"}</td>
                    <td className="py-3.5 px-4">
                      {u.role === "super_admin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                          <ShieldCheck size={14} /> SUPER ADMIN
                        </span>
                      ) : (
                        <select
                          className="p-1.5 border rounded-lg text-xs font-medium bg-white text-slate-800"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        >
                          <option value="staff">Staff / Nurse</option>
                          <option value="technician">Technician</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                          <Clock size={14} /> Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== "super_admin" && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApproveToggle(u._id, u.isApproved)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              u.isApproved
                                ? "bg-amber-100 hover:bg-amber-200 text-amber-800"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {u.isApproved ? "Revoke Access" : "Approve User"}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            title="Delete User"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}