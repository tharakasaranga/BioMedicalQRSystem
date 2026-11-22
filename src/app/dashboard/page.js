"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { QrCode, PlusCircle, Wrench, ClipboardList, LogOut, ShieldAlert, Users, Activity, AlertTriangle, CheckCircle2, PackageCheck } from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ equipments: 0, operational: 0, activeFaults: 0, highPriority: 0 });
  const [loading, setLoading] = useState(true);
  const unauthorizedError = searchParams.get("error") === "unauthorized";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const me = await meRes.json();
        if (!me.user) {
          router.push("/login");
          return;
        }
        setUser(me.user);

        const [eqRes, faultRes] = await Promise.all([fetch("/api/equipments"), fetch("/api/faults")]);
        const eqData = await eqRes.json();
        const faultData = await faultRes.json();
        const equipments = eqData.equipments || [];
        const faults = faultData.faults || [];
        const activeFaults = faults.filter((fault) => fault.status !== "Resolved");
        setStats({
          equipments: equipments.reduce((sum, item) => sum + (item.quantity || 1), 0),
          operational: equipments.reduce((sum, item) => sum + (item.operationalQty ?? (item.quantity || 1)), 0),
          activeFaults: activeFaults.length,
          highPriority: activeFaults.filter((fault) => fault.priority === "High").length,
        });
      } catch {
        toast.error("Some dashboard information could not be loaded");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("You have been signed out");
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading dashboard...</div>;
  if (!user) return null;

  const isAdminOrSuper = user.role === "admin" || user.role === "super_admin";
  const cards = [
    { href: "/dashboard/scan", title: "Scan Equipment QR", text: "Open the camera scanner or enter an asset ID manually.", icon: QrCode, iconClass: "bg-blue-100 text-blue-600", border: "hover:border-blue-500", show: true },
    { href: "/dashboard/stock", title: "Equipment & Stock", text: "Register devices, manage wards and generate QR labels.", icon: PlusCircle, iconClass: "bg-emerald-100 text-emerald-600", border: "hover:border-emerald-500", show: isAdminOrSuper },
    { href: "/dashboard/manage-faults", title: "Maintenance Queue", text: "Review prioritized reports and update repair progress.", icon: Wrench, iconClass: "bg-amber-100 text-amber-600", border: "hover:border-amber-500", show: isAdminOrSuper || user.role === "technician" },
    { href: "/dashboard/equipments", title: "Equipment Analytics", text: "Browse the full asset register and live stock health.", icon: ClipboardList, iconClass: "bg-purple-100 text-purple-600", border: "hover:border-purple-500", show: true },
    { href: "/dashboard/users", title: "User Management", text: "Approve registrations, assign roles and manage access.", icon: Users, iconClass: "bg-indigo-100 text-indigo-600", border: "hover:border-indigo-500", show: user.role === "super_admin" },
  ];

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Bio Medical QR" width={44} height={44} className="h-11 w-11 rounded-xl bg-slate-50 p-1" />
            <div className="hidden sm:block"><h1 className="text-base font-bold text-blue-700">Bio Medical QR System</h1><p className="text-xs text-slate-500">Equipment & maintenance workspace</p></div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right"><p className="max-w-36 truncate text-sm font-bold text-slate-800">{user.name}</p><span className="text-[10px] font-bold uppercase tracking-wide text-blue-700">{user.role.replace("_", " ")}</span></div>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"><LogOut size={15}/><span className="hidden sm:inline">Logout</span></button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {unauthorizedError && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><ShieldAlert size={20}/><span><strong>Access denied.</strong> You do not have permission to open that page.</span></div>}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-600 p-5 text-white shadow-lg shadow-blue-900/10 sm:p-8">
          <div className="relative z-10 max-w-2xl"><p className="text-sm font-semibold text-blue-100">Hospital operations overview</p><h2 className="mt-1 text-2xl font-bold sm:text-3xl">Good to see you, {user.name?.split(" ")[0]}</h2><p className="mt-2 text-sm leading-6 text-blue-50">Monitor clinical assets, report faults and keep maintenance activities moving.</p></div>
          <Activity className="absolute -bottom-8 right-4 h-36 w-36 text-white/10 sm:right-10" />
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Stock Units", value: stats.equipments, icon: PackageCheck, className: "text-blue-600 bg-blue-50" },
            { label: "Operational", value: stats.operational, icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50" },
            { label: "Active Faults", value: stats.activeFaults, icon: AlertTriangle, className: "text-amber-600 bg-amber-50" },
            { label: "High Priority", value: stats.highPriority, icon: ShieldAlert, className: "text-red-600 bg-red-50" },
          ].map((item) => (
            <div key={item.label} className="dashboard-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><item.icon size={20} className={item.className.split(" ")[0]}/><span className={`rounded-lg px-2 py-1 ${item.className}`}></span></div>
              <p className="mt-3 text-2xl font-extrabold text-slate-800">{item.value}</p><p className="mt-0.5 text-xs font-semibold text-slate-500">{item.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Quick access</p><h3 className="mt-1 text-xl font-bold text-slate-800">Workspace tools</h3></div></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.filter((card) => card.show).map((card) => (
              <Link key={card.href} href={card.href} className={`dashboard-card group flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 ${card.border}`}>
                <div className={`rounded-xl p-3 ${card.iconClass}`}><card.icon size={26}/></div>
                <div><h4 className="font-bold text-slate-800">{card.title}</h4><p className="mt-2 text-sm leading-6 text-slate-500">{card.text}</p><span className="mt-3 inline-block text-xs font-bold text-blue-600 opacity-0 transition group-hover:opacity-100">Open tool →</span></div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>}><DashboardContent /></Suspense>;
}
