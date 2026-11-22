"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Wrench, CheckCircle2, Clock, AlertCircle, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageFaultsPage() {
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ACTIVE"); // ACTIVE = Pending + In Progress

  // Modal / Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchFaults = async () => {
    const res = await fetch("/api/faults");
    if (res.ok) {
      const data = await res.json();
      setFaults(data.faults);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFaults();
  }, []);

  const startEditing = (fault) => {
    setEditingId(fault._id);
    setEditStatus(fault.status);
    setEditNotes(fault.technicianNotes || "");
  };

  const handleUpdate = async (faultId) => {
    setSaving(true);
    const res = await fetch(`/api/faults/${faultId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus, technicianNotes: editNotes }),
    });

    setSaving(false);
    if (res.ok) {
      setEditingId(null);
      fetchFaults();
      toast.success("Maintenance status updated");
    } else {
      toast.error("Failed to update status");
    }
  };

  const filteredFaults = faults.filter((f) => {
    const matchPriority = filterPriority === "ALL" || f.priority === filterPriority;
    const matchStatus =
      filterStatus === "ALL"
        ? true
        : filterStatus === "ACTIVE"
        ? f.status !== "Resolved"
        : f.status === "Resolved";
    return matchPriority && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Wrench className="text-amber-600" /> Prioritized Maintenance Queue
            </h1>
            <p className="text-sm text-slate-500">Faults are automatically sorted by urgency (High → Medium → Low).</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              className="p-2 border rounded-lg text-sm bg-white text-slate-700 font-medium"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ACTIVE">Active (Pending & In Progress)</option>
              <option value="RESOLVED">Resolved History</option>
              <option value="ALL">All Reports</option>
            </select>

            <select
              className="p-2 border rounded-lg text-sm bg-white text-slate-700 font-medium"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority Only</option>
              <option value="Medium">Medium Priority Only</option>
              <option value="Low">Low Priority Only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading maintenance queue...</div>
        ) : filteredFaults.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center border border-slate-200 text-slate-400">
            No fault reports match your filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaults.map((f) => (
              <div
                key={f._id}
                className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${
                  f.priority === "High"
                    ? "border-l-red-600"
                    : f.priority === "Medium"
                    ? "border-l-amber-500"
                    : "border-l-blue-500"
                } border border-slate-200`}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          f.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : f.priority === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {f.priority} Priority
                      </span>

                      <Link
                        href={`/equipment/${f.equipment?.assetId}`}
                        className="font-mono text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded"
                      >
                        {f.equipment?.assetId}
                      </Link>

                      <span className="text-xs text-slate-400">
                        Reported {new Date(f.createdAt).toLocaleString()} by <strong>{f.reportedBy?.name}</strong>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800">
                      {f.equipment?.name}{" "}
                      <span className="text-sm font-normal text-slate-500">({f.equipment?.department})</span>
                    </h3>

                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong>Issue:</strong> {f.issueDescription}
                    </p>

                    {f.technicianNotes && editingId !== f._id && (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg">
                        <strong>Technician Notes:</strong> {f.technicianNotes}
                      </p>
                    )}
                  </div>

                  {/* Right Status & Action Panel */}
                  <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l pt-3 lg:pt-0 lg:pl-4 border-slate-100">
                    {editingId === f._id ? (
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600">Update Status</label>
                          <select
                            className="mt-1 w-full p-2 border rounded-lg text-sm bg-white text-slate-800"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved (Mark Fixed)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600">Technician Notes</label>
                          <textarea
                            rows="2"
                            placeholder="Parts replaced, calibration done..."
                            className="mt-1 w-full p-2 border rounded-lg text-xs text-slate-800"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(f._id)}
                            disabled={saving}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <Save size={14} /> {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between items-start lg:items-end gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            f.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : f.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {f.status === "Resolved" ? (
                            <CheckCircle2 size={14} />
                          ) : f.status === "In Progress" ? (
                            <Clock size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                          {f.status}
                        </span>

                        <button
                          onClick={() => startEditing(f)}
                          className="w-full lg:w-auto bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                        >
                          Update Status / Add Note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}