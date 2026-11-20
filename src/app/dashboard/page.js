"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { QrCode, PlusCircle, Wrench, ClipboardList, LogOut, ShieldAlert } from "lucide-react";


function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const unauthorizedError = searchParams.get("error") === "unauthorized";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
        } else {
          setUser(data.user);
        }
        setLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-700">BioMed QR System</h1>
          <p className="text-xs text-slate-500">Fault Reporting & Maintenance Prioritization</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase font-medium">
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>


      <main className="max-w-6xl mx-auto p-6">
        {unauthorizedError && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl flex items-center gap-3">
            <ShieldAlert size={20} />
            <span>Access Denied: You do not have permission to view that page.</span>
          </div>
        )}

        <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>

      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Link
            href="/dashboard/scan"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500 transition flex items-start gap-4"
          >
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <QrCode size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Scan Equipment QR</h3>
              <p className="text-sm text-slate-500 mt-1">
                Scan machine QR using camera to view details or report a fault.
              </p>
            </div>
          </Link>

       
          {user.role === "admin" && (
            <Link
              href="/dashboard/stock"
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-500 transition flex items-start gap-4"
            >
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                <PlusCircle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Equipment & Stock</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Add new biomedical devices, manage categories/wards, and generate QR codes.
                </p>
              </div>
            </Link>
          )}

   
          {(user.role === "admin" || user.role === "technician") && (
            <Link
              href="/dashboard/manage-faults"
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-amber-500 transition flex items-start gap-4"
            >
              <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                <Wrench size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Maintenance Queue</h3>
                <p className="text-sm text-slate-500 mt-1">
                  View prioritized fault reports (High/Medium/Low) and update repair status.
                </p>
              </div>
            </Link>
          )}

    
          <Link
            href="/dashboard/equipments"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-purple-500 transition flex items-start gap-4"
          >
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <ClipboardList size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">All Equipments & Logs</h3>
              <p className="text-sm text-slate-500 mt-1">
                Browse registered hospital devices and check maintenance history.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}