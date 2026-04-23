import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [recentUsers, setRecentUsers] = useState([]);

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

    // Fetch recent users for live dashboard view
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRecentUsers(data.slice(0, 5));
    } catch (err) {
      console.error("Dashboard user fetch error:", err);
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
    { key: "users", label: "Customers", sub: "User Base", icon: <LuUsers />, to: "/customers", val: stats?.users },
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:y-12">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] text-emerald-700">Operations</p>
            {loading && <LuRefreshCw className="animate-spin text-emerald-600" size={14} />}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Nursery <br className="hidden md:block" />
            Control Centre
          </h1>
          <p className="text-slate-400 font-medium max-w-lg text-xs md:text-sm leading-relaxed">
            Real-time snapshot of catalogue health, demand, and revenue — built for daily merchandising workflows.
          </p>
          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
        </div>

        <div className="w-full lg:w-auto bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm flex items-center gap-4 md:gap-6 lg:min-w-[340px] group transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 text-xl md:text-2xl transition-all duration-300 shadow-inner">
            <LuTrendingUp />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 md:mb-1">Net Revenue</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter transition-colors group-hover:text-emerald-700">
              {stats ? `₹${revenue.toLocaleString("en-IN")}` : "—"}
            </h2>
            <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-0.5 md:mt-1 italic">Synced with sales</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((c) => (
          <Link
            key={c.key}
            to={c.to}
            className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-100 hover:border-emerald-200 transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl text-slate-400 transition-all duration-300 flex-shrink-0">
              {c.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                {c.label}
              </p>
              <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">{c.val ?? "—"}</h3>
              <p className="text-[8px] md:text-[9px] font-bold text-emerald-600 uppercase tracking-tighter mt-0.5">{c.sub}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Recent Registrations Feed */}
      <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50" />
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-emerald-800 mb-1">Live Feed</h2>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Recent Registrations</h3>
          </div>
          <Link to="/customers" className="px-5 py-2.5 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 relative z-10">
          {recentUsers.length > 0 ? (
            recentUsers.map((u) => (
              <div key={u._id} className="bg-slate-50/50 border border-slate-100/50 p-6 rounded-[2rem] hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-200">
                    {u.name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate capitalize">{u.name || "Customer"}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-600 uppercase tracking-tighter italic">
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-full py-10 text-center text-slate-400 font-medium text-sm">
               No recent registrations found.
             </div>
          )}
        </div>
      </section>

      <section className="space-y-6 md:space-y-8 pt-4 md:pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-800">Operational Shortcuts</h2>
          <button
            type="button"
            onClick={load}
            className={`p-2 rounded-xl text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors ${loading ? "animate-spin" : ""}`}
          >
            <LuRefreshCw />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {shortcuts.map((task, i) => (
            <Link
              key={i}
              to={task.to}
              className="bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] hover:shadow-xl hover:border-emerald-200 transition-all group overflow-hidden flex flex-col h-full"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl text-slate-400 mb-6 md:mb-8 transition-all duration-300">
                {task.icon}
              </div>
              <h4 className="text-xs md:text-sm font-black text-slate-800 mb-1">{task.title}</h4>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-medium mb-6 md:mb-8 leading-relaxed flex-1">{task.desc}</p>
              <div className="flex items-center gap-2 text-emerald-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Open Tool <LuArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
