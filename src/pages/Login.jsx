import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LuLeaf, LuLock, LuMail, LuArrowRight, LuSparkles } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5008";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      if (!data.token || !data.admin) {
        setError("Unexpected response from server");
        return;
      }
      login(data.token, data.admin);
      navigate(from, { replace: true });
    } catch {
      setError("Network error — is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_55%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[440px]"
      >
        <div className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
          <LuSparkles className="text-emerald-500" size={14} />
          Admin
        </div>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_32px_64px_-24px_rgba(15,23,42,0.18)] p-10 sm:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <LuLeaf size={28} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Nursery</p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Control centre
              </h1>
            </div>
          </div>

          <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
            Sign in with your admin email to manage catalogue, orders, and storefront content.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-[11px] font-bold text-slate-500 ml-1 mb-2 flex items-center gap-2">
                <LuMail size={14} className="text-emerald-600" />
                Email
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-300"
                placeholder="you@nursery.com"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-bold text-slate-500 ml-1 mb-2 flex items-center gap-2">
                <LuLock size={14} className="text-emerald-600" />
                Password
              </span>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 pr-24 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:text-emerald-900"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 text-white py-4 text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                "Signing in…"
              ) : (
                <>
                  Continue
                  <LuArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-[11px] text-slate-400 font-medium">
            Protected area — only authorised nursery staff.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          API: <span className="font-mono text-slate-500">{API_BASE}</span>
        </p>
      </motion.div>
    </div>
  );
}
