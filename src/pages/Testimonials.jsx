// pages/Testimonials.jsx
import React, { useCallback, useEffect, useState } from "react";
import { LuQuote, LuTrash2, LuRefreshCw } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5008";

export default function Testimonials() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", city: "", rating: "5", review: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/testimonials/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to load");
        setItems([]);
        return;
      }
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError("Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/testimonials`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          city: form.city.trim(),
          rating: Number(form.rating),
          review: form.review.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Could not create");
        return;
      }
      setForm({ name: "", email: "", city: "", rating: "5", review: "" });
      await load();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const setApproval = async (id, isApproved) => {
    try {
      const res = await fetch(`${API_BASE}/api/testimonials/admin/${id}/approval`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ isApproved }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || "Update failed");
        return;
      }
      await load();
    } catch {
      alert("Network error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/testimonials/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }
      await load();
    } catch {
      alert("Network error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      <header className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-700 mb-2">Customer Voice</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Testimonials</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage customer feedback, approval statuses, and storefront highlights.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className={`w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm ${loading ? "animate-spin" : ""}`}
        >
          <LuRefreshCw size={20} />
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3">{error}</div>
      )}

      <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-slate-100">
            <LuQuote />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Registration</h2>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Record New Feedback</p>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Customer Name *</span>
              <input className="admin-input-flat" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</span>
              <input className="admin-input-flat" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Location / City</span>
              <input className="admin-input-flat" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Rating</span>
              <select className="admin-input-flat" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}>
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="1">⭐ 1 Star</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Review Content *</span>
            <textarea
              className="admin-input-flat"
              rows={4}
              value={form.review}
              onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
              required
              placeholder="What did the customer say about their experience?"
            />
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button
              type="submit"
              disabled={saving}
              className="px-12 py-4 bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-800 transition-all active:scale-95 flex items-center gap-2"
            >
              {saving ? "Registering..." : "Publish Testimonial"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Management Portal</h2>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {items.length}</div>
        </div>

        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center text-slate-400 font-medium">Loading…</div>
        ) : items.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100 shadow-inner">
              <LuQuote size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">No Customer Feedback Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium leading-relaxed">
              Add testimonials using the form above or wait for customer submissions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-4 py-4">Rating</th>
                  <th className="px-4 py-4">Review</th>
                  <th className="px-4 py-4">Approved</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t._id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-8 py-4 font-bold text-slate-800">{t.name}</td>
                    <td className="px-4 py-4">{t.rating}</td>
                    <td className="px-4 py-4 max-w-md truncate text-slate-600">{t.review}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setApproval(t._id, !t.isApproved)}
                        className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
                          t.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t.isApproved ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button type="button" onClick={() => remove(t._id)} className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-xs font-bold">
                        <LuTrash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .admin-input-flat {
          width: 100%;
          padding: 0.875rem 1rem;
          background: #f8fafc;
          border: 1.5px solid #f1f5f9;
          border-radius: 1rem;
          font-weight: 700;
          color: #334155;
          outline: none;
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }
        .admin-input-flat:focus {
          border-color: #059669;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.05);
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-bottom-2 { from { transform: translateY(0.5rem); } to { transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s ease-out, slide-in-from-bottom-2 0.3s ease-out; }
      `,
        }}
      />
    </div>
  );
}
