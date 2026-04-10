// pages/Categories.jsx
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LuPlus, LuRefreshCw, LuLayers, LuPencil, LuTrash2 } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5008";

export default function Categories() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to load");
        setItems([]);
        return;
      }
      setItems(data.items || []);
    } catch {
      setError("Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
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
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-700 mb-2">Taxonomy</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Categories</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Organize your botanical inventory into segments and collections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={load}
            className={`w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm ${loading ? "animate-spin" : ""}`}
          >
            <LuRefreshCw size={20} />
          </button>
          <Link
            to="/categories/new"
            className="px-8 py-3.5 bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-800 transition-all flex items-center gap-2 active:scale-95"
          >
            <LuPlus size={16} />
            Add Category
          </Link>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3">{error}</div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[400px] overflow-hidden relative"
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-medium">Loading…</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-8 border border-slate-100 shadow-inner">
              <LuLayers size={44} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">No Categories Defined</h2>
            <p className="text-slate-400 max-w-sm font-medium leading-relaxed mb-10 text-sm">
              Your taxonomy is empty. Add a category to organize products.
            </p>
            <Link
              to="/categories/new"
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
            >
              Define First Category
            </Link>
          </div>
        ) : (
          <div className="relative z-10 divide-y divide-slate-100">
            {items.map((c) => (
              <div key={c._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 hover:bg-slate-50/80 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.kind}</p>
                  <h3 className="text-lg font-black text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {c.slug || "—"} · {c.isActive ? "Active" : "Hidden"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/categories/${c._id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-white"
                  >
                    <LuPencil size={14} />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(c._id)}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-red-100 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50"
                  >
                    <LuTrash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="py-4 px-8 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Total: {items.length} categories</span>
        </div>
      </motion.div>
    </div>
  );
}
