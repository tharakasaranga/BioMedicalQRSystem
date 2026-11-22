"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Plus, QrCode, Printer, Download, X } from "lucide-react";
import toast from "react-hot-toast";

export default function StockManagementPage() {
  const [equipments, setEquipments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stock Form State
  const [formData, setFormData] = useState({
    name: "",
    assetId: "",
    category: "",
    department: "",
    serialNumber: "",
    manufacturer: "",
    quantity: 1,
    status: "Operational",
  });

  // Dynamic Dropdown Add States
  const [newCategory, setNewCategory] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);

  // Selected Equipment for QR Modal
  const [selectedQR, setSelectedQR] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [eqRes, setRes] = await Promise.all([
      fetch("/api/equipments"),
      fetch("/api/settings"),
    ]);
    const eqData = await eqRes.json();
    const setData = await setRes.json();

    if (eqData.equipments) setEquipments(eqData.equipments);
    if (setData.settings) {
      setCategories(setData.settings.filter((s) => s.type === "category"));
      setDepartments(setData.settings.filter((s) => s.type === "department"));
    }
  };

  // Dropdown එකට අලුත් Category හෝ Department එකක් Add කිරීම
  const handleAddSetting = async (type, value, resetFn, closeFn) => {
    if (!value.trim()) return;
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value }),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchData();
      setFormData((prev) => ({ ...prev, [type]: data.setting.value }));
      resetFn("");
      closeFn(false);
      toast.success(`${type === "category" ? "Category" : "Department"} added successfully`);
    } else {
      toast.error(data.message || "Could not add the setting");
    }
  };

  // අලුත් Equipment එකක් Submit කිරීම
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.department) {
      toast.error("Please select or add both Category and Department.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/equipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setFormData({
        name: "",
        assetId: "",
        category: formData.category,
        department: formData.department,
        serialNumber: "",
        manufacturer: "",
        quantity: 1,
        status: "Operational",
      });
      await fetchData();
      setSelectedQR(data.equipment); // Add කරපු ගමන් QR එක පෙන්නනවා
      toast.success("Equipment saved and QR generated");
    } else {
      toast.error(data.message || "Could not save the equipment");
    }
  };

  // QR Code URL එක සෑදීම (Phone එකෙන් scan කළාම open වෙන link එක)
  const getEquipmentUrl = (assetId) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/equipment/${assetId}`;
  };

  // QR Image Download කිරීම
  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedQR.assetId}-QR.png`;
    a.click();
  };

  // QR Sticker Print කිරීම
  const printQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head><title>Print QR - ${selectedQR.assetId}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <div style="border:2px solid #000;padding:20px;border-radius:10px;text-align:center;">
            <h3 style="margin:0 0 10px 0;">${selectedQR.name}</h3>
            <img src="${dataUrl}" style="width:200px;height:200px;" />
            <p style="margin:10px 0 0 0;font-weight:bold;font-size:16px;">${selectedQR.assetId}</p>
            <p style="margin:4px 0 0 0;font-size:12px;color:#555;">Dept: ${selectedQR.department}</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">Equipment & Stock Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Add Equipment Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Equipment</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Multipara Patient Monitor"
                  className="mt-1 w-full p-2 border rounded-lg text-sm text-slate-800"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Dynamic Category Dropdown + Add New */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Category *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCat(!showAddCat)}
                    className="text-xs text-blue-600 font-medium flex items-center gap-0.5 hover:underline"
                  >
                    <Plus size={12} /> Add New
                  </button>
                </div>

                {showAddCat && (
                  <div className="flex gap-1.5 mt-1.5 mb-2">
                    <input
                      type="text"
                      placeholder="New Category (e.g. Autoclave)"
                      className="flex-1 p-1.5 border rounded text-xs text-slate-800"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSetting("category", newCategory, setNewCategory, setShowAddCat)}
                      className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-medium"
                    >
                      Save
                    </button>
                  </div>
                )}

                <select
                  required
                  className="mt-1 w-full p-2 border rounded-lg text-sm text-slate-800 bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.value}>{c.value}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Department / Ward Dropdown + Add New */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Department / Ward *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddDept(!showAddDept)}
                    className="text-xs text-blue-600 font-medium flex items-center gap-0.5 hover:underline"
                  >
                    <Plus size={12} /> Add New
                  </button>
                </div>

                {showAddDept && (
                  <div className="flex gap-1.5 mt-1.5 mb-2">
                    <input
                      type="text"
                      placeholder="New Ward (e.g. ICU, Theatre)"
                      className="flex-1 p-1.5 border rounded text-xs text-slate-800"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSetting("department", newDepartment, setNewDepartment, setShowAddDept)}
                      className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-medium"
                    >
                      Save
                    </button>
                  </div>
                )}

                <select
                  required
                  className="mt-1 w-full p-2 border rounded-lg text-sm text-slate-800 bg-white"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.value}>{d.value}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Serial Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="SN-98765"
                    className="mt-1 w-full p-2 border rounded-lg text-sm text-slate-800"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Asset ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    className="mt-1 w-full p-2 border rounded-lg text-sm text-slate-800"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="Philips / GE"
                    className="mt-1 w-full p-2 border rounded-lg text-sm text-slate-800"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 w-full p-2 border rounded-lg text-sm text-slate-800"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition text-sm"
              >
                {loading ? "Saving & Generating QR..." : "Save Equipment & Generate QR"}
              </button>
            </form>
          </div>

          {/* Right Column: Registered Stock Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2 overflow-x-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Registered Equipment Stock ({equipments.length})</h2>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs text-slate-500 uppercase">
                  <th className="py-3 px-2">Asset ID</th>
                  <th className="py-3 px-2">Equipment</th>
                  <th className="py-3 px-2">Dept / Category</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">QR Code</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {equipments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No equipment added yet. Add your first device from the form!
                    </td>
                  </tr>
                ) : (
                  equipments.map((eq) => (
                    <tr key={eq._id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 font-mono font-semibold text-blue-700">{eq.assetId}</td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-slate-800">{eq.name}</div>
                        <div className="text-xs text-slate-400">SN: {eq.serialNumber}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-slate-700">{eq.department}</span>
                        <span className="block text-xs text-slate-400">{eq.category}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                        <button
                          onClick={() => setSelectedQR(eq)}
                          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          <QrCode size={14} /> View QR
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Code Modal (Print / Download) */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative shadow-xl">
            <button
              onClick={() => setSelectedQR(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800">{selectedQR.name}</h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedQR.department} • {selectedQR.category}
            </p>

            <div ref={qrRef} className="bg-white p-4 border-2 border-dashed border-slate-300 rounded-xl inline-block">
              <QRCodeCanvas
                value={getEquipmentUrl(selectedQR.assetId)}
                size={200}
                level="H"
                includeMargin={true}
              />
              <p className="font-mono font-bold text-slate-800 mt-2">{selectedQR.assetId}</p>
            </div>

            <p className="text-xs text-slate-400 mt-3 break-all">
              Scan Link: {getEquipmentUrl(selectedQR.assetId)}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={downloadQR}
                className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={printQR}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-medium"
              >
                <Printer size={16} /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}