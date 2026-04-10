import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LuShield, LuUserPlus, LuRefreshCw, LuTrash2 } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

export default function Settings() {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/getAllAdmins`, { headers: authHeaders });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to load admins");
        return;
      }
      setAdmins(data.data || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/create`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Could not create admin");
        return;
      }
      setForm({ name: "", email: "", password: "", role: "admin" });
      await load();
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/deleteAdmin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Delete failed");
        return;
      }
      await load();
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-700 mb-2">
            Superadmin
          </p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LuShield className="text-emerald-600" />
            Settings
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage admin accounts. Only superadmin can access this page.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className={`w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm ${loading ? "animate-spin" : ""}`}
        >
          <LuRefreshCw size={20} />
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3">
          {error}
        </div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <LuUserPlus size={22} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Create admin</h2>
            <p className="text-[11px] text-slate-400 font-medium">New accounts receive the selected role.</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-slate-400">Name</span>
            <input
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-slate-400">Email</span>
            <input
              required
              type="email"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-slate-400">Password</span>
            <input
              required
              type="password"
              minLength={6}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-slate-400">Role</span>
            <select
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="admin">admin</option>
              <option value="superadmin">superadmin</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="px-8 py-3.5 bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-800 disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create admin"}
            </button>
          </div>
        </form>
      </motion.section>

      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">All admins</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-8 py-4">Name</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-medium">
                    Loading…
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-medium">
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((a) => (
                  <tr key={a._id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-8 py-4 font-bold text-slate-800">{a.name}</td>
                    <td className="px-4 py-4 text-slate-600">{a.email}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                          a.role === "superadmin" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {a.role}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(a._id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-bold"
                      >
                        <LuTrash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
