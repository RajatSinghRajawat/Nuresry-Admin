import React, { useCallback, useEffect, useState } from "react";
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
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 md:space-y-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <p className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-emerald-700">
            Superadmin
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LuShield className="text-emerald-600" size={28} />
            Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-xs md:max-w-none">
            Manage admin accounts. Only superadmin can access this page.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className={`w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm ${loading ? "animate-spin" : ""}`}
        >
          <LuRefreshCw size={18} />
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3">
          {error}
        </div>
      )}

      <section className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <LuUserPlus size={20} />
          </div>
          <div>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-800">Create admin</h2>
            <p className="text-[10px] md:text-[11px] text-slate-400 font-medium">New accounts receive the selected role.</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 ml-1">Name</span>
            <input
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-emerald-500 outline-none transition-all"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 ml-1">Email</span>
            <input
              required
              type="email"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-emerald-500 outline-none transition-all"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 ml-1">Password</span>
            <input
              required
              type="password"
              minLength={6}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-emerald-500 outline-none transition-all"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 ml-1">Role</span>
            <select
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-emerald-500 outline-none transition-all cursor-pointer"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="admin">admin</option>
              <option value="superadmin">superadmin</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={creating}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-800 disabled:opacity-60 transition-all active:scale-95"
            >
              {creating ? "Creating…" : "Create admin"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-4 md:py-5 border-b border-slate-50">
          <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-800">All admins</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 md:px-8 py-4">Name</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-6 md:px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
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
                  <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 md:px-8 py-4 font-bold text-slate-800 text-xs md:text-sm whitespace-nowrap">{a.name}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs md:text-sm">{a.email}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase ${
                          a.role === "superadmin" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {a.role}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(a._id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-[10px] md:text-xs font-bold transition-colors"
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
