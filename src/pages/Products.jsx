// pages/Products.jsx
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LuPlus, LuSearch, LuPackageSearch, LuPencil, LuTrash2, LuRefreshCw } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

export default function Products() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "24" });
      if (debounced) qs.set("search", debounced);
      const res = await fetch(`${API_BASE}/api/products?${qs.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to load products");
        setItems([]);
        return;
      }
      setItems(data.items || []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
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

  const thumb = (p) => {
    if (!p) return "";

    // Priority 1: images array (new format)
    if (Array.isArray(p.images) && p.images.length > 0) {
      return p.images[0];
    }

    // Priority 2: old image field (backward compatibility)
    if (Array.isArray(p.image) && p.image.length > 0) {
      return p.image[0];
    }

    // Priority 3: single string (very old format)
    if (typeof p.image === "string" && p.image) {
      return p.image;
    }

    return "";
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <header className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-700 mb-2">Catalogue</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage your nursery inventory and storefront visibility.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className={`w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm ${loading ? "animate-spin" : ""}`}
          >
            <LuRefreshCw size={20} />
          </button>
          <Link
            to="/products/new"
            className="px-8 py-3.5 bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-800 transition-all flex items-center gap-2 active:scale-95"
          >
            <LuPlus size={16} />
            Add New Product
          </Link>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3">{error}</div>
      )}

      <div className="relative group">
        <LuSearch
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-700 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name, SKU or category..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-700 focus:shadow-[0_0_0_4px_rgba(4,120,87,0.05)] transition-all placeholder:text-slate-300"
        />
      </div>

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
              <LuPackageSearch size={44} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
              {debounced ? `No results for "${debounced}"` : "No Products Found"}
            </h2>
            <p className="text-slate-400 max-w-sm font-medium leading-relaxed mb-10 text-sm">
              {debounced
                ? "Try another search term."
                : "Your nursery inventory is empty. Add your first product to get started."}
            </p>
            {!debounced && (
              <Link
                to="/products/new"
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
              >
                Launch First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="relative z-10 divide-y divide-slate-100">
            {items.map((p) => (
              <div key={p._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 hover:bg-slate-50/80 transition-colors">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0">
                  {/* {thumb(p) ? (
                    <img src={thumb(p)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <LuPackageSearch />
                    </div>
                  )} */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0">
                    {thumb(p) ? (
                      <img
                         src={`https://greenbeli.in/uploads/${thumb(p)}`}
                        
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <LuPackageSearch size={28} />
                      </div>
                    )}

                    
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.sku}</p>
                  <h3 className="text-lg font-black text-slate-900 truncate">{p.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    ₹{Number(p.price || 0).toLocaleString("en-IN")} · Stock {p.stock ?? 0}{" "}
                    <span className={p.isActive ? "text-emerald-600" : "text-slate-400"}>
                      · {p.isActive ? "Published" : "Hidden"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/products/${p._id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-white"
                  >
                    <LuPencil size={14} />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(p._id)}
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

        <div className="py-4 px-8 border-t border-slate-50 bg-slate-50/50 flex flex-wrap justify-between items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>
            Page {page} · Showing {items.length} of {total} items
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page * 24 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
