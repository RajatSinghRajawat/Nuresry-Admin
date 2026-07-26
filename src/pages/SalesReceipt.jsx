import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer, Sprout } from "lucide-react";

export default function SalesReceipt() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/sales" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to POS Sales
      </Link>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-700" />
            <h2 className="serif-font font-bold text-xl text-slate-900">GreenBeli Nursery Receipt</h2>
          </div>
          <button onClick={() => window.print()} className="bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        <div className="text-xs space-y-4 text-slate-700">
          <p>Receipt #REC-884920 • Date: {new Date().toLocaleDateString("en-IN")}</p>
          <p>Customer: Walk-in Customer</p>
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="flex justify-between">
              <span>Monstera Deliciosa x 1</span>
              <span className="font-bold">₹899</span>
            </div>
            <div className="flex justify-between">
              <span>Handcrafted Ceramic Planter x 1</span>
              <span className="font-bold">₹649</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-emerald-950 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span>₹1548</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
