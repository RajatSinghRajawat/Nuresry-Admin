import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();

  const [email, setEmail] = useState("admin@greenbeli.in");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await loginAdmin(email, password);
    setLoading(false);

    if (res.success) {
      navigate("/");
    } else {
      setError(res.message || "Invalid admin credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl space-y-6 border border-emerald-800/40">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-lg">
            <Sprout className="w-7 h-7" />
          </div>
          <h1 className="serif-font text-2xl font-bold text-slate-900">GreenBeli Admin Portal</h1>
          <p className="text-xs text-slate-500">Sign in to manage catalog, orders & nursery operations.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@greenbeli.in"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating Admin..." : "Access Dashboard"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1 border-t border-slate-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Restricted Admin Portal • GreenBeli Nursery</span>
        </div>
      </div>
    </div>
  );
}
