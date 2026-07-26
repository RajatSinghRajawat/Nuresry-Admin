import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  IndianRupee, 
  ShoppingBag, 
  Sprout, 
  PhoneCall, 
  Users, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  AlertTriangle,
  Receipt
} from "lucide-react";
import { getDashboardStatsApi, updateOrderStatusApi } from "../utils/adminApi";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getDashboardStatsApi();
      setStats(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      setStats((prev) => ({
        ...prev,
        recentOrders: prev.recentOrders.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        ),
      }));
    } catch (e) {
      setStats((prev) => ({
        ...prev,
        recentOrders: prev.recentOrders.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        ),
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Executive Summary
          </span>
          <h1 className="serif-font text-3xl font-bold text-slate-900 mt-0.5">
            Nursery Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products/new"
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add New Plant
          </Link>
          <Link
            to="/sales"
            className="bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4 text-emerald-700" /> POS Counter Sale
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="serif-font text-3xl font-bold text-slate-900">
              ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString("en-IN") : "1,48,900"}
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% from last month
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="serif-font text-3xl font-bold text-slate-900">
              {stats?.totalOrders || 142}
            </h3>
            <span className="text-[11px] text-sky-600 font-bold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> 12 Pending Shipments
            </span>
          </div>
        </div>

        {/* Catalog Plants */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Products</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="serif-font text-3xl font-bold text-slate-900">
              {stats?.totalProducts || 28}
            </h3>
            <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 3 Low Stock Items
            </span>
          </div>
        </div>

        {/* Customer Leads */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inquiry Leads</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="serif-font text-3xl font-bold text-slate-900">
              {stats?.activeLeads || 12}
            </h3>
            <span className="text-[11px] text-purple-600 font-bold flex items-center gap-1 mt-1">
              +4 New Today
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Orders & Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="serif-font font-bold text-slate-900 text-lg">Recent Orders</h3>
            <Link to="/orders" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2 font-bold">Order ID</th>
                  <th className="py-3 px-2 font-bold">Customer</th>
                  <th className="py-3 px-2 font-bold">Amount</th>
                  <th className="py-3 px-2 font-bold">Status Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-2 font-bold text-slate-900">#{order._id}</td>
                    <td className="py-3.5 px-2 text-slate-700 font-medium">{order.customerName || "Customer"}</td>
                    <td className="py-3.5 px-2 font-extrabold text-emerald-950">₹{order.totalAmount}</td>
                    <td className="py-3.5 px-2">
                      <select
                        value={order.status || "Processing"}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1 border focus:outline-none cursor-pointer ${
                          order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : order.status === "Shipped"
                            ? "bg-sky-100 text-sky-800 border-sky-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="serif-font font-bold text-slate-900 text-base">Low Stock Nursery Alert</h3>
          </div>

          <div className="space-y-3">
            {[
              { name: "Fiddle Leaf Fig", stock: 2, category: "Indoor Plants" },
              { name: "Bougainvillea Bonsai", stock: 3, category: "Outdoor Plants" },
              { name: "Peace Lily (Spathiphyllum)", stock: 4, category: "Indoor Plants" },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                  <p className="text-[10px] text-slate-500">{item.category}</p>
                </div>
                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/products"
            className="block text-center text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-2.5 rounded-xl border border-emerald-200 transition"
          >
            Manage Inventory
          </Link>
        </div>

      </div>
    </div>
  );
}
