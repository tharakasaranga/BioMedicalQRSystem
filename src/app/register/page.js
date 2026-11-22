"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { CheckCircle2, UserRound, Mail, LockKeyhole, Building2, BriefcaseBusiness, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "staff", department: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccessMsg(data.message);
      toast.success(data.message || "Registration submitted successfully");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell grid min-h-screen lg:grid-cols-[0.88fr_1.12fr]">
      <aside className="auth-surface hidden lg:flex flex-col justify-between p-10 xl:p-14 text-white">
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl bg-white p-2 shadow-xl"><Image src="/logo.png" alt="Bio Medical QR System" width={52} height={52} className="h-12 w-12 object-contain" /></div>
          <div><p className="font-bold text-lg">Bio Medical QR</p><p className="text-xs text-blue-100">Role-based clinical workspace</p></div>
        </div>
        <div className="relative z-10 max-w-md">
          <p className="text-sm font-semibold text-blue-100">Join the equipment network</p>
          <h1 className="mt-3 text-4xl xl:text-5xl font-bold leading-tight">Create your secure staff account.</h1>
          <p className="mt-5 text-base leading-7 text-blue-100">Choose your hospital role and department. An administrator will review access before you can use protected functions.</p>
          <div className="mt-8 space-y-3">
            {["Equipment QR access", "Fault reporting and history", "Role-specific maintenance tools"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm"><ShieldCheck size={17}/>{item}</div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-blue-100">Account approval keeps clinical equipment data protected.</p>
      </aside>

      <main className="flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-xl">
          <div className="mb-5 flex items-center justify-center gap-3 lg:hidden">
            <Image src="/logo.png" alt="Bio Medical QR System" width={56} height={56} className="h-14 w-14 rounded-xl bg-white p-1.5 shadow-md"/>
            <div><p className="font-bold text-slate-800">Bio Medical QR</p><p className="text-xs text-slate-500">Create your account</p></div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-700 dark:shadow-black/20">
            {successMsg ? (
              <div className="py-5 text-center">
                <CheckCircle2 size={58} className="mx-auto text-emerald-600"/>
                <h2 className="mt-4 text-2xl font-bold text-slate-800">Registration submitted</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{successMsg}</p>
                <Link href="/login" className="mt-6 block rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700">Continue to Login</Link>
              </div>
            ) : (
              <>
                <div className="mb-6"><p className="text-sm font-bold text-blue-600">Create account</p><h2 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">Your hospital details</h2><p className="mt-2 text-sm text-slate-500">Complete the form for administrator approval.</p></div>
                {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</label><div className="relative"><UserRound size={17} className="absolute left-3.5 top-3.5 text-slate-400"/><input type="text" required className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Dr. Kasun Perera" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}/></div></div>
                  <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail size={17} className="absolute left-3.5 top-3.5 text-slate-400"/><input type="email" required className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="kasun@hospital.lk" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/></div></div>
                  <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label><div className="relative"><LockKeyhole size={17} className="absolute left-3.5 top-3.5 text-slate-400"/><input type="password" required minLength={6} className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Minimum 6 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}/></div></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Requested role</label><div className="relative"><BriefcaseBusiness size={17} className="absolute left-3.5 top-3.5 text-slate-400"/><select className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm text-slate-800" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}><option value="staff">Staff / Nurse</option><option value="technician">Technician</option><option value="admin">Admin</option></select></div></div>
                    <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Department</label><div className="relative"><Building2 size={17} className="absolute left-3.5 top-3.5 text-slate-400"/><input type="text" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm text-slate-800" placeholder="ICU / OPD" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}/></div></div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">{loading ? "Submitting registration..." : "Submit for approval"}</button>
                </form>
                <p className="mt-5 text-center text-sm text-slate-600">Already registered? <Link href="/login" className="font-bold text-blue-600 hover:underline">Sign in</Link></p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
