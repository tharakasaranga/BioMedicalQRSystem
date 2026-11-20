"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      router.push("/login?registered=true");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Create Account</h2>
        <p className="text-sm text-slate-500 text-center mb-6">Biomedical Equipment Management System</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              required
              className="mt-1 w-full p-2.5 border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Dr. Kasun Perera"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full p-2.5 border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="kasun@hospital.lk"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full p-2.5 border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <select
                className="mt-1 w-full p-2.5 border rounded-lg text-slate-800 bg-white"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="staff">Staff / Nurse</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Department</label>
              <input
                type="text"
                className="mt-1 w-full p-2.5 border rounded-lg text-slate-800"
                placeholder="ICU / OPD"
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}