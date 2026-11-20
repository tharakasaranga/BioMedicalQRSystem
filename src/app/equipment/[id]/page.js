"use client";
import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, Wrench } from "lucide-react";

function EquipmentDetailContent({ params }) {
  const { id } = use(params);
  const [equipment, setEquipment] = useState(null);
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedPriority, setSubmittedPriority] = useState(null);

  // Fault Form State
  const [issueDescription, setIssueDescription] = useState("");
  const [deviceStoppedWorking, setDeviceStoppedWorking] = useState(false);
  const [isCriticalEquipment, setIsCriticalEquipment] = useState(false);
  const [isMinorCosmetic, setIsMinorCosmetic] = useState(false);

  const fetchEquipmentData = async () => {
    const res = await fetch(`/api/equipments/${id}`);
    if (res.ok) {
      const data = await res.json();
      setEquipment(data.equipment);
      setFaults(data.faults);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipmentData();
  }, [id]);

  const handleFaultSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/faults", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipmentId: equipment._id,
        issueDescription,
        deviceStoppedWorking,
        isCriticalEquipment,
        isMinorCosmetic,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (res.ok) {
      setSubmittedPriority(data.fault.priority);
      setIssueDescription("");
      setDeviceStoppedWorking(false);
      setIsCriticalEquipment(false);
      setIsMinorCosmetic(false);
      fetchEquipmentData();
    } else {
      alert(data.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Equipment Details...</div>;
  if (!equipment) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Equipment Not Found!</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* 1. Equipment Info Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
                {equipment.assetId}
              </span>
              <h1 className="text-2xl font-bold text-slate-800 mt-2">{equipment.name}</h1>
              <p className="text-sm text-slate-500">
                {equipment.category} • Department: <strong className="text-slate-700">{equipment.department}</strong>
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                equipment.status === "Operational"
                  ? "bg-emerald-100 text-emerald-700"
                  : equipment.status === "Under Maintenance"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {equipment.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Serial Number</span>
              <span className="font-medium text-slate-700">{equipment.serialNumber}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Manufacturer</span>
              <span className="font-medium text-slate-700">{equipment.manufacturer}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Stock Qty</span>
              <span className="font-medium text-slate-700">{equipment.quantity} Unit(s)</span>
            </div>
          </div>
        </div>

        {/* 2. Digital Fault Reporting Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <AlertTriangle className="text-amber-500" size={20} /> Report a Fault
          </h2>

          {submittedPriority && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              ✅ Fault reported successfully! Assigned Maintenance Priority:{" "}
              <span className="font-bold uppercase underline">{submittedPriority}</span>
            </div>
          )}

          <form onSubmit={handleFaultSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Describe the Issue *</label>
              <textarea
                required
                rows="3"
                placeholder="e.g., Display screen flickering, power button not responding..."
                className="w-full p-3 border rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
            </div>

            {/* Rule-Based Priority Checkboxes */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2.5 border border-slate-200">
              <p className="text-xs font-bold text-slate-600 uppercase">Severity Assessment (For Auto-Prioritization)</p>

              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-red-600"
                  checked={deviceStoppedWorking}
                  onChange={(e) => {
                    setDeviceStoppedWorking(e.target.checked);
                    if (e.target.checked) setIsMinorCosmetic(false);
                  }}
                />
                <span>Machine completely stopped working / Not powering on</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-red-600"
                  checked={isCriticalEquipment}
                  onChange={(e) => {
                    setIsCriticalEquipment(e.target.checked);
                    if (e.target.checked) setIsMinorCosmetic(false);
                  }}
                />
                <span>Critical / Life-support device (Urgent patient care impact)</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-600"
                  checked={isMinorCosmetic}
                  onChange={(e) => {
                    setIsMinorCosmetic(e.target.checked);
                    if (e.target.checked) {
                      setDeviceStoppedWorking(false);
                      setIsCriticalEquipment(false);
                    }
                  }}
                />
                <span>Minor issue / Cosmetic damage only (Machine still usable)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              {submitting ? "Submitting Report..." : "Submit Fault Report"}
            </button>
          </form>
        </div>

        {/* 3. Maintenance & Fault History */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Wrench className="text-slate-600" size={20} /> Maintenance History ({faults.length})
          </h2>

          {faults.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No faults reported for this equipment yet.</p>
          ) : (
            <div className="space-y-3">
              {faults.map((f) => (
                <div key={f._id} className="p-4 border rounded-xl bg-slate-50 flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          f.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : f.priority === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {f.priority} Priority
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(f.createdAt).toLocaleDateString()} • By {f.reportedBy?.name || "Staff"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 mt-1.5 font-medium">{f.issueDescription}</p>
                    {f.technicianNotes && (
                      <p className="text-xs text-emerald-700 mt-1 bg-emerald-50 p-2 rounded">
                        <strong>Technician Note:</strong> {f.technicianNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center self-start">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white border">
                      {f.status === "Resolved" ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Clock size={14} className="text-amber-600" />}
                      {f.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EquipmentDetailPage({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Equipment Details...</div>}>
      <EquipmentDetailContent params={params} />
    </Suspense>
  );
}