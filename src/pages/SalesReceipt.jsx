// pages/SalesReceipt.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuPrinter, LuChevronLeft, LuLeaf, LuFileText } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5008";

export default function SalesReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setError(data?.message || "Sale not found");
        setSale(null);
        return;
      }
      setSale(data);
    } catch {
      setError("Network error");
      setSale(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePrint = () => window.print();

  const product = sale?.productId;
  const admin = sale?.adminId;
  const qty = sale?.quantity ?? 0;
  const total = sale?.totalAmount ?? 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-8 min-h-screen flex flex-col items-center">
      <header className="w-full max-w-2xl flex justify-between items-center admin-no-print">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 group text-slate-400 hover:text-slate-800 transition-all"
        >
          <div className="p-2 rounded-xl bg-white border border-slate-100 group-hover:bg-slate-50 transition-all">
            <LuChevronLeft size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back to Sales</span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="px-8 py-3.5 bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-800 transition-all flex items-center gap-2 active:scale-95"
        >
          <LuPrinter size={16} />
          Print Receipt
        </button>
      </header>

      {error && (
        <div className="w-full max-w-2xl rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3 admin-no-print">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden receipt-shadow"
      >
        <div className="p-12 pb-8 border-b border-dashed border-slate-100 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-emerald-600 rounded-b-full" />

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-black tracking-tighter text-2xl mb-2">
                <LuLeaf size={24} />
                <span>Nursery Empire</span>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Official Sales Receipt</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-300 mb-1">Receipt ID</p>
              <p className="text-lg font-black text-slate-800 tracking-tighter">
                {id ? `#${String(id).slice(-8)}` : "#PENDING"}
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 ring-1 ring-slate-50 p-6 rounded-2xl bg-slate-50/30">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Transaction Date</p>
              <p className="text-sm font-bold text-slate-700">
                {sale?.createdAt ? new Date(sale.createdAt).toLocaleString("en-IN") : loading ? "…" : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Issued By</p>
              <p className="text-sm font-bold text-slate-700">{admin?.name || admin?.email || "—"}</p>
            </div>
          </div>
        </div>

        <div className="p-12 pt-10 pb-6 space-y-10">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 text-center">Summary of Sale</h3>

          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm font-bold text-slate-600 pb-4 border-b border-slate-50">
              <span>Product Name / SKU</span>
              <span>Total</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 font-medium">Loading…</div>
            ) : !sale ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <LuFileText className="text-slate-200" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No data</p>
              </div>
            ) : (
              <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                <span>
                  {product?.name || "Product"} · {product?.sku || "—"}
                </span>
                <span>₹{Number(total).toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>

          <div className="pt-8 border-t-2 border-slate-100 border-dotted space-y-3">
            <div className="flex justify-between text-slate-400 font-bold text-xs">
              <span>Quantity</span>
              <span>{qty}</span>
            </div>
            <div className="flex justify-between pt-4 text-2xl font-black text-slate-900 tracking-tighter">
              <span className="uppercase text-[10px] tracking-widest text-emerald-600 self-center">Grand Total</span>
              <span>₹{Number(total).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/50 p-8 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thank you for your purchase!</p>
          <p className="text-[9px] font-medium text-slate-300 italic px-8">This is a system generated receipt.</p>
        </div>
      </motion.div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .admin-no-print { display: none !important; }
          body { background: white !important; }
          .receipt-shadow { box-shadow: none !important; border: 1px solid #eee !important; }
          @page { margin: 0.5cm; }
        }
        .receipt-shadow {
           box-shadow: 0 40px 100px -20px rgba(4, 120, 87, 0.08);
        }
      `,
        }}
      />
    </div>
  );
}
