// pages/Sales.jsx — superadmin-only route; APIs live here
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuTrendingUp, LuPackage, LuSearch, LuRefreshCw, LuFileText } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

export default function Sales() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({
    totals: { totalQuantity: 0, totalAmount: 0, saleCount: 0 },
    byAdmin: [],
  });

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [productId, setProductId] = useState("");

  const [products, setProducts] = useState([]);

  const [createProductId, setCreateProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products?limit=100`);
      const data = await res.json().catch(() => ({}));
      setProducts(data.items || []);
    } catch {
      setProducts([]);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    setError("");
    try {
      const qs = new URLSearchParams();
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      if (productId) qs.set("productId", productId);
      const res = await fetch(`${API_BASE}/api/sales/summary?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Could not load summary");
        return;
      }
      setSummary({
        totals: data.totals || { totalQuantity: 0, totalAmount: 0, saleCount: 0 },
        byAdmin: data.byAdmin || [],
      });
    } catch {
      setError("Network error");
    }
  }, [token, from, to, productId]);

  const fetchSales = useCallback(
    async (pageOverride) => {
      const pageNum = pageOverride !== undefined ? pageOverride : page;
      setError("");
      setLoading(true);
      try {
        const qs = new URLSearchParams({ page: String(pageNum), limit: "24" });
        if (from) qs.set("from", from);
        if (to) qs.set("to", to);
        if (productId) qs.set("productId", productId);
        const res = await fetch(`${API_BASE}/api/sales?${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.message || "Could not load sales");
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
    },
    [token, page, from, to, productId]
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleRefresh = () => {
    loadSummary();
    fetchSales();
  };

  const createSale = async (e) => {
    e.preventDefault();
    if (!createProductId) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/sales`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          productId: createProductId,
          quantity: Number(quantity) || 1,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Could not create sale");
        return;
      }
      if (data._id) {
        navigate(`/sales/${data._id}`);
        return;
      }
      await loadSummary();
      await fetchSales(page);
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const totals = summary.totals || { totalQuantity: 0, totalAmount: 0, saleCount: 0 };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      <header className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-700 mb-2">Reporting</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sales Dashboard</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Track transactions, calculate revenue, and manage nursery sales (superadmin).
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className={`w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm ${loading ? "animate-spin" : ""}`}
        >
          <LuRefreshCw size={20} />
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Revenue", value: `₹${Number(totals.totalAmount || 0).toLocaleString("en-IN")}`, sub: "Filtered range", icon: <LuTrendingUp /> },
          { label: "Items Sold", value: String(totals.totalQuantity ?? 0), sub: "Total unit count", icon: <LuPackage /> },
          { label: "Records", value: String(totals.saleCount ?? 0), sub: "Total transactions", icon: <LuFileText /> },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 flex items-center justify-center text-2xl transition-all duration-300 shadow-inner">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight transition-colors group-hover:text-emerald-700">{stat.value}</h3>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-1 italic">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Date From</span>
              <input className="admin-input-flat" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Date To</span>
              <input className="admin-input-flat" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Filter by Product</span>
              <select className="admin-input-flat" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
                setProductId("");
                setPage(1);
                setTimeout(() => {
                  loadSummary();
                  fetchSales(1);
                }, 0);
              }}
              className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                loadSummary();
                fetchSales(1);
              }}
              className="px-10 py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
            >
              Apply Filter
            </button>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Quick Record</h2>
          <form className="space-y-6" onSubmit={createSale}>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Product</span>
              <select className="admin-input-flat" value={createProductId} onChange={(e) => setCreateProductId(e.target.value)} required>
                <option value="">— Select —</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Quantity</span>
              <input className="admin-input-flat" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </label>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-4 bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-800 transition-all active:scale-95"
            >
              {creating ? "Processing..." : "Create & Print Receipt"}
            </button>
          </form>
        </section>
      </div>

      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Transaction History</h2>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {items.length} of {total} Records
          </div>
        </div>

        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center text-slate-400 font-medium">Loading…</div>
        ) : items.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
              <LuSearch size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">No Sales Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">Try adjusting filters or record a new sale.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-4">When</th>
                  <th className="px-4 py-4">Product</th>
                  <th className="px-4 py-4">Qty</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-8 py-4">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s._id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-8 py-4 text-xs text-slate-500">{new Date(s.createdAt).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-4 font-bold text-slate-800">{s.productId?.name || "—"}</td>
                    <td className="px-4 py-4">{s.quantity}</td>
                    <td className="px-4 py-4 font-black">₹{Number(s.totalAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-8 py-4">
                      <Link to={`/sales/${s._id}`} className="text-emerald-700 font-black text-xs uppercase tracking-widest hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="py-4 px-8 border-t border-slate-50 bg-slate-50/50 flex flex-wrap justify-between items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Page {page}</span>
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
      `,
        }}
      />
    </div>
  );
}
