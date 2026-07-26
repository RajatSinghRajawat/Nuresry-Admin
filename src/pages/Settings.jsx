import React, { useState } from "react";
import { Settings as SettingsIcon, Save, ShieldCheck, UserPlus } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Settings() {
  const { admin } = useAdminAuth();

  const [storeName, setStoreName] = useState("GreenBeli Botanical Hub");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [supportEmail, setSupportEmail] = useState("support@greenbeli.in");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(499);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          System Control
        </span>
        <h1 className="serif-font text-3xl font-bold text-slate-900 mt-0.5">
          Nursery Store Settings
        </h1>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl">
          ✓ System configurations saved successfully!
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="serif-font font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
          Store Information & Policy Defaults
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Helpline Phone</label>
            <input
              type="tel"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-900 flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>

      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="serif-font font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
          Logged In Administrator Profile
        </h3>
        <div className="text-xs text-slate-700 space-y-1">
          <p><b>Name:</b> {admin?.name || "Super Admin"}</p>
          <p><b>Email:</b> {admin?.email || "admin@greenbeli.in"}</p>
          <p><b>Privilege Role:</b> {admin?.role || "superadmin"}</p>
        </div>
      </div>
    </div>
  );
}
