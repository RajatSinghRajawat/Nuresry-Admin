// pages/Dashboard.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuPackage,
  LuLayers,
  LuShoppingBag,
  LuTrendingUp,
  LuUsers,
  LuPlus,
  LuLayoutGrid,
  LuArrowRight,
  LuRefreshCw,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

export default function Dashboard() {
  const { token, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Could not load stats");
        setStats(null);
        return;
      }
      setStats(data);
    } catch {
      setError("Network error");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    { key: "products", label: "SKU Catalogue", sub: "Live listings", icon: <LuPackage />, to: "/products", val: stats?.products },
    { key: "categories", label: "Categories", sub: "Taxonomy & SEO", icon: <LuLayers />, to: "/categories", val: stats?.categories },
    { key: "orders", label: "Orders Queue", sub: "Fulfillment", icon: <LuShoppingBag />, to: "/orders", val: stats?.orders },
    {
      key: "sales",
      label: "Total Sales",
      sub: "Transactions",
      icon: <LuTrendingUp />,
      to: "/sales",
      val: stats?.salesCount,
      superOnly: true,
    },
    { key: "users", label: "Customers", sub: "User Base", icon: <LuUsers />, to: "/orders", val: stats?.users },
  ].filter((c) => !c.superOnly || isSuperAdmin);

  const revenue = stats ? Number(stats.revenue || 0) : 0;

  const shortcuts = [
    { title: "Add New SKU", desc: "Full plant profile & media", to: "/products/new", icon: <LuPlus /> },
    { title: "Taxonomy", desc: "Organise segments & meta", to: "/categories", icon: <LuLayoutGrid /> },
    { title: "Fulfillment", desc: "Fulfill orders & shipping", to: "/orders", icon: <LuShoppingBag /> },
    ...(isSuperAdmin
      ? [{ title: "Analytics", desc: "Track sales & receipts", to: "/sales", icon: <LuTrendingUp /> }]
      : []),
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-700">Operations</p>
            {loading && <LuRefreshCw className="animate-spin text-emerald-600" size={14} />}
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Nursery <br />
            Control Centre
          </h1>
          <p className="text-slate-400 font-medium max-w-lg text-sm leading-relaxed">
            Real-time snapshot of catalogue health, demand, and revenue — built for daily merchandising workflows.
          </p>
          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
        </div>

        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 min-w-[340px] group transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
          <div className="w-16 h-16 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white rounded-2xl flex items-center justify-center text-emerald-600 text-2xl transition-all duration-300 shadow-inner">
            <LuTrendingUp />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Net Revenue</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter transition-colors group-hover:text-emerald-700">
              {stats ? `₹${revenue.toLocaleString("en-IN")}` : "—"}
            </h2>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-1 italic">Synced with sales</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={c.to}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all duration-300 flex items-center gap-5 group"
            >
              <div className="w-14 h-14 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white rounded-2xl flex items-center justify-center text-xl text-slate-400 transition-all duration-300 flex-shrink-0">
                {c.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  {c.label}
                </p>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{c.val ?? "—"}</h3>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter mt-0.5">{c.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <section className="space-y-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Operational Shortcuts</h2>
          <button
            type="button"
            onClick={load}
            className={`p-2 rounded-xl text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors ${loading ? "animate-spin" : ""}`}
          >
            <LuRefreshCw />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shortcuts.map((task, i) => (
            <Link
              key={i}
              to={task.to}
              className="bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-xl hover:border-emerald-200 transition-all group overflow-hidden flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white rounded-2xl flex items-center justify-center text-xl text-slate-400 mb-8 transition-all duration-300">
                {task.icon}
              </div>
              <h4 className="text-sm font-black text-slate-800 mb-1">{task.title}</h4>
              <p className="text-[11px] text-slate-400 font-medium mb-8 leading-relaxed flex-1">{task.desc}</p>
              <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Open Tool <LuArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
