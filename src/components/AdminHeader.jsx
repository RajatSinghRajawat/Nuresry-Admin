import React from "react";
import { Menu, Search, Bell, ExternalLink, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminHeader({ toggleSidebar }) {
  const { admin } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block w-72">
          <input
            type="text"
            placeholder="Search orders, plants, customers..."
            className="w-full bg-slate-100/80 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition"
        >
          <span>View Live Store</span> <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="relative">
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-600 rounded-full" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold uppercase">
            {admin?.name ? admin.name[0] : "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{admin?.name || "Admin"}</p>
            <span className="text-[10px] text-slate-400 font-semibold">{admin?.email || "admin@greenbeli.in"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
