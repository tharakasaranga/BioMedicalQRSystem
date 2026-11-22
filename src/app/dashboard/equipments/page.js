"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Activity, CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react";

export default function AllEquipmentsAnalyticsPage() {
  const [equipments, setEquipments] = useState([]);
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    Promise.all([fetch("/api/equipments"), fetch("/api/faults")])
      .then(([eqRes, fRes]) => Promise.all([eqRes.json(), fRes.json()]))
      .then(([eqData, fData]) => {
        if (eqData.equipments) setEquipments(eqData.equipments);
        if (fData.faults) setFaults(fData.faults);
        setLoading(false);
      });
  }, []);

  // Exact Unit-Based Analytics Calculations
  const totalUnits = equipments.reduce((sum, e) => sum + (e.quantity || 1), 0);
  const operationalUnits = equipments.reduce((sum, e) => sum + (e.operationalQty ?? (e.quantity || 1)), 0);
  const maintenanceUnits = equipments.reduce((sum, e) => sum + (e.maintenanceQty || 0), 0);
  const outOfOrderUnits = equipments.reduce((sum, e) => sum + (e.outOfOrderQty || 0), 0);

  const activeFaults = faults.filter((f) => f.status !== "Resolved");
  const highPriorityCount = activeFaults.filter((f) => f.priority === "High").length;
  const mediumPriorityCount = activeFaults.filter((f) => f.priority === "Medium").length;
  const lowPriorityCount = activeFaults.filter((f) => f.priority === "Low").length;

  const getPercentage = (count, total) => (total === 0 ? 0 : Math.round((count / total) * 100));

  const filteredEquipments = equipments.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || eq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Visual Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-slate-800">Equipment Status & Visual Analytics Dashboard</h1>

        {/* 1. Top KPI Summary Cards (Exact Unit Counts) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Total Stock Units</span>
              <Activity size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{totalUnits}</p>
            <p className="text-xs text-slate-400 mt-1">Across {equipments.length} device types</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-emerald-600 text-xs font-bold uppercase">
              <span>Operational Units</span>
              <CheckCircle size={18} />
            </div>
            <p className="text-3xl font-extrabold text-emerald-700 mt-2">{operationalUnits}</p>
            <p className="text-xs text-slate-400 mt-1">{getPercentage(operationalUnits, totalUnits)}% readiness rate</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-amber-600 text-xs font-bold uppercase">
              <span>Under Maintenance</span>
              <AlertTriangle size={18} />
            </div>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{maintenanceUnits}</p>
            <p className="text-xs text-slate-400 mt-1">Units in active repair</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-red-600 text-xs font-bold uppercase">
              <span>Out of Order Units</span>
              <XCircle size={18} />
            </div>
            <p className="text-3xl font-extrabold text-red-600 mt-2">{outOfOrderUnits}</p>
            <p className="text-xs text-slate-400 mt-1">{highPriorityCount} High-priority alerts</p>
          </div>
        </div>

        {/* 2. Visual Analytics Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4">Stock Unit Health Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Operational ({operationalUnits} units)</span>
                  <span>{getPercentage(operationalUnits, totalUnits)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(operationalUnits, totalUnits)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">Under Maintenance ({maintenanceUnits} units)</span>
                  <span>{getPercentage(maintenanceUnits, totalUnits)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(maintenanceUnits, totalUnits)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-red-700">Out of Order ({outOfOrderUnits} units)</span>
                  <span>{getPercentage(outOfOrderUnits, totalUnits)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(outOfOrderUnits, totalUnits)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4">
              Active Fault Reports by Priority ({activeFaults.length} Open)
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-red-700">High Priority ({highPriorityCount})</span>
                  <span>{getPercentage(highPriorityCount, activeFaults.length)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(highPriorityCount, activeFaults.length)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">Medium Priority ({mediumPriorityCount})</span>
                  <span>{getPercentage(mediumPriorityCount, activeFaults.length)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(mediumPriorityCount, activeFaults.length)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-700">Low Priority ({lowPriorityCount})</span>
                  <span>{getPercentage(lowPriorityCount, activeFaults.length)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(lowPriorityCount, activeFaults.length)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Equipment Directory Table with Unit Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-800">All Biomedical Equipments</h2>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, ID, or ward..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="p-2 border rounded-lg text-sm bg-white text-slate-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Operational">Operational</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Order">Out of Order</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs text-slate-500 uppercase">
                  <th className="py-3 px-2">Asset ID</th>
                  <th className="py-3 px-2">Equipment Name</th>
                  <th className="py-3 px-2">Department</th>
                  <th className="py-3 px-2">Stock Breakdown</th>
                  <th className="py-3 px-2 text-right">History & Report</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredEquipments.map((eq) => {
                  const tot = eq.quantity || 1;
                  const op = eq.operationalQty ?? tot;
                  const maint = eq.maintenanceQty || 0;
                  const out = eq.outOfOrderQty || 0;

                  return (
                    <tr key={eq._id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 font-mono font-semibold text-blue-700">{eq.assetId}</td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-slate-800">{eq.name}</div>
                        <div className="text-xs text-slate-400">{eq.category}</div>
                      </td>
                      <td className="py-3 px-2 text-slate-600">{eq.department}</td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">Total: {tot}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">OK: {op}</span>
                          {maint > 0 && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700">Maint: {maint}</span>
                          )}
                          {out > 0 && (
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">Out: {out}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          href={`/equipment/${eq.assetId}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-semibold"
                        >
                          Open <ExternalLink size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}