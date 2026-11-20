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

  // Analytics Calculations
  const totalDevices = equipments.length;
  const operationalCount = equipments.filter((e) => e.status === "Operational").length;
  const maintenanceCount = equipments.filter((e) => e.status === "Under Maintenance").length;
  const outOfOrderCount = equipments.filter((e) => e.status === "Out of Order").length;

  const activeFaults = faults.filter((f) => f.status !== "Resolved");
  const highPriorityCount = activeFaults.filter((f) => f.priority === "High").length;
  const mediumPriorityCount = activeFaults.filter((f) => f.priority === "Medium").length;
  const lowPriorityCount = activeFaults.filter((f) => f.priority === "Low").length;

  const getPercentage = (count, total) => (total === 0 ? 0 : Math.round((count / total) * 100));

  // Filtered Equipment List
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

        {/* 1. Top KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Total Devices</span>
              <Activity size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{totalDevices}</p>
            <p className="text-xs text-slate-400 mt-1">Registered biomedical assets</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-emerald-600 text-xs font-bold uppercase">
              <span>Operational</span>
              <CheckCircle size={18} />
            </div>
            <p className="text-3xl font-extrabold text-emerald-700 mt-2">{operationalCount}</p>
            <p className="text-xs text-slate-400 mt-1">{getPercentage(operationalCount, totalDevices)}% readiness rate</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-amber-600 text-xs font-bold uppercase">
              <span>Under Maintenance</span>
              <AlertTriangle size={18} />
            </div>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{maintenanceCount}</p>
            <p className="text-xs text-slate-400 mt-1">Active repair or inspection</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-red-600 text-xs font-bold uppercase">
              <span>Out of Order</span>
              <XCircle size={18} />
            </div>
            <p className="text-3xl font-extrabold text-red-600 mt-2">{outOfOrderCount}</p>
            <p className="text-xs text-slate-400 mt-1">{highPriorityCount} High-priority alerts</p>
          </div>
        </div>

        {/* 2. Visual Analytics Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart A: Equipment Health Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4">Equipment Status Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Operational ({operationalCount})</span>
                  <span>{getPercentage(operationalCount, totalDevices)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(operationalCount, totalDevices)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">Under Maintenance ({maintenanceCount})</span>
                  <span>{getPercentage(maintenanceCount, totalDevices)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(maintenanceCount, totalDevices)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-red-700">Out of Order ({outOfOrderCount})</span>
                  <span>{getPercentage(outOfOrderCount, totalDevices)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(outOfOrderCount, totalDevices)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chart B: Active Faults by Priority */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4">
              Active Faults by Priority ({activeFaults.length} Open)
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

        {/* 3. Equipment Directory Table */}
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
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">History & Report</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredEquipments.map((eq) => (
                  <tr key={eq._id} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-mono font-semibold text-blue-700">{eq.assetId}</td>
                    <td className="py-3 px-2 font-medium text-slate-800">{eq.name}</td>
                    <td className="py-3 px-2 text-slate-600">{eq.department}</td>
                    <td className="py-3 px-2 text-slate-500">{eq.category}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          eq.status === "Operational"
                            ? "bg-emerald-100 text-emerald-700"
                            : eq.status === "Under Maintenance"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {eq.status}
                      </span>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}