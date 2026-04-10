import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout() {
  return (
    <div className="bg-[#fcfdfc] min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden relative flex">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-50/50 blur-[120px] rounded-full" />
      </div>

      <Sidebar />

      <div className="flex-1 min-w-0 relative z-10">
        <Topbar />
        <main className="ml-64 pt-28 p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
