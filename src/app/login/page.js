"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { LockKeyhole, Mail, ShieldCheck, QrCode, Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      toast.success("Welcome back! Opening your dashboard.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <section className="auth-surface hidden lg:flex flex-col justify-between p-10 xl:p-16 text-white">
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl bg-white p-2 shadow-xl"><Image src="/logo.png" alt="Bio Medical QR System" width={52} height={52} className="h-12 w-12 object-contain" /></div>
          <div><p className="font-bold text-lg">Bio Medical QR</p><p className="text-xs text-blue-100">Equipment Intelligence Platform</p></div>
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold"><Activity size={14}/> Reliable clinical asset management</span>
          <h1 className="mt-6 text-4xl xl:text-5xl font-bold leading-tight">Keep every medical device connected and ready.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-blue-100">Scan, report, monitor and maintain biomedical equipment from one secure hospital workspace.</p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><QrCode size={20}/><p className="mt-2 font-semibold">QR Tracking</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><ShieldCheck size={20}/><p className="mt-2 font-semibold">Secure Access</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><Activity size={20}/><p className="mt-2 font-semibold">Live Status</p></div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-blue-100">Hospital asset visibility · Maintenance prioritization · Digital fault history</p>
      </section>

      <main className="flex items-center justify-center p-5 sm:p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-7 flex flex-col items-center lg:hidden">
            <Image src="/logo.png" alt="Bio Medical QR System" width={72} height={72} className="h-18 w-18 rounded-2xl bg-white p-2 shadow-lg"/>
            <p className="mt-3 text-sm font-bold text-blue-700">Bio Medical QR System</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-700 dark:shadow-black/20">
            <div className="mb-7"><p className="text-sm font-semibold text-blue-600">Secure sign in</p><h2 className="mt-1 text-3xl font-bold text-slate-800">Welcome back</h2><p className="mt-2 text-sm text-slate-500">Enter your account details to continue.</p></div>
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail size={17} className="absolute left-3.5 top-3.5 text-slate-400"/><input type="email" required autoComplete="email" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="name@hospital.lk" onChange={(e) => setFormData({ ...formData, email: e.target.value })}/></div></div>
              <div><div className="mb-1.5 flex justify-between"><label className="text-sm font-semibold text-slate-700">Password</label></div><div className="relative"><LockKeyhole size={17} className="absolute left-3.5 top-3.5 text-slate-400"/><input type="password" required autoComplete="current-password" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Enter your password" onChange={(e) => setFormData({ ...formData, password: e.target.value })}/></div></div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in..." : "Sign in to dashboard"}</button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">New to the system? <Link href="/register" className="font-bold text-blue-600 hover:underline">Create an account</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
}