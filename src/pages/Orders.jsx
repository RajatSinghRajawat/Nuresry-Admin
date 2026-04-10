// pages/Orders.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
  LuShoppingBag,
  LuPackage,
  LuTrendingUp,
  LuRefreshCw,
  LuUser,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5008";
const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "20" });
      const res = await fetch(`${API_BASE}/api/admin/orders?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to load orders");
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
  }, [token, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (orderId, orderStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderStatus }),
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-600";
      case "Shipped":
        return "bg-blue-50 text-blue-600";
      case "Processing":
        return "bg-orange-50 text-orange-600";
      case "Cancelled":
        return "bg-red-50 text-red-500";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  const activeCount = items.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length;
  const fulfilledTotal = items.filter((o) => o.orderStatus === "Delivered").reduce((s, o) => s + Number(o.totalPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      <header className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-700 mb-2">Fulfillment</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Orders</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Track customer purchases, manage shipments, and update order statuses.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Active Orders", value: String(activeCount), sub: "Currently processing", icon: <LuShoppingBag /> },
          { label: "On this page", value: String(items.length), sub: "Rows loaded", icon: <LuPackage /> },
          {
            label: "Page revenue (sample)",
            value: `₹${fulfilledTotal.toLocaleString("en-IN")}`,
            sub: "Delivered on page",
            icon: <LuTrendingUp />,
          },
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

      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Order Queue</h2>
            <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total: {total}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center text-slate-400 font-medium">Loading…</div>
        ) : items.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border border-slate-100 shadow-inner">
              <LuPackage size={44} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">No Orders Found</h2>
            <p className="text-slate-400 max-w-sm font-medium leading-relaxed text-sm">
              No orders yet. They will appear here when customers place orders on the storefront.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-4">Order</th>
                  <th className="px-4 py-4">Customer</th>
                  <th className="px-4 py-4">Total</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o._id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-8 py-4 font-mono text-xs text-slate-500">{String(o._id).slice(-8)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <LuUser className="text-slate-300" size={16} />
                        {o.user?.name || o.user?.firstName || o.user?.email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-black text-slate-900">₹{Number(o.totalPrice || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className={`admin-input-flat text-xs font-black uppercase ${getStatusColor(o.orderStatus)} border-0`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="py-4 px-8 border-t border-slate-50 bg-slate-50/50 flex flex-wrap justify-between items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>
            Page {page} · {items.length} rows
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
              disabled={page * 20 >= total}
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
          padding: 0.6rem 0.75rem;
          background: #f8fafc;
          border: 1.5px solid #f1f5f9;
          border-radius: 0.75rem;
          font-weight: 700;
          color: #334155;
          outline: none;
          transition: all 0.2s ease;
          font-size: 0.75rem;
        }
        .admin-input-flat:focus {
          border-color: #059669;
          background: #fff;
        }
      `,
        }}
      />
    </div>
  );
}
