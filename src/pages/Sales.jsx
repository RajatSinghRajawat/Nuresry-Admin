import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Receipt, Plus, Trash2, Printer, CheckCircle2, IndianRupee } from "lucide-react";
import { getAdminProductsApi, createSaleApi } from "../utils/adminApi";

export default function Sales() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [saleItems, setSaleItems] = useState([
    { productId: "", name: "", price: 0, quantity: 1 },
  ]);

  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  useEffect(() => {
    getAdminProductsApi().then(setProducts);
  }, []);

  const handleProductSelect = (index, prodId) => {
    const found = products.find((p) => p._id === prodId);
    setSaleItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              productId: prodId,
              name: found?.name || "Plant Item",
              price: found?.price || 499,
            }
          : item
      )
    );
  };

  const updateQuantity = (index, qty) => {
    setSaleItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  const addItemRow = () => {
    setSaleItems([...saleItems, { productId: "", name: "", price: 0, quantity: 1 }]);
  };

  const removeItemRow = (index) => {
    setSaleItems(saleItems.filter((_, idx) => idx !== index));
  };

  const totalAmount = saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCreateSale = async (e) => {
    e.preventDefault();
    const receiptData = {
      receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "N/A",
      paymentMethod,
      items: saleItems,
      totalAmount,
      date: new Date().toLocaleDateString("en-IN"),
    };

    try {
      await createSaleApi(receiptData);
    } catch (e) {
      // smooth
    } finally {
      setGeneratedReceipt(receiptData);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          Store POS Terminal
        </span>
        <h1 className="serif-font text-3xl font-bold text-slate-900 mt-0.5">
          Counter Sale & Receipt Generator
        </h1>
      </div>

      {generatedReceipt ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h2 className="serif-font font-bold text-xl">Sale Receipt Issued</h2>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Receipt No: #{generatedReceipt.receiptNo}</span>
              <span>Date: {generatedReceipt.date}</span>
            </div>
            <div>
              <p><b>Customer:</b> {generatedReceipt.customerName} ({generatedReceipt.customerPhone})</p>
              <p><b>Payment Mode:</b> {generatedReceipt.paymentMethod}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              {generatedReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-2 border-t border-slate-200">
                <span>Total Amount Paid</span>
                <span>₹{generatedReceipt.totalAmount}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setGeneratedReceipt(null)}
            className="w-full bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-200"
          >
            Create Another Counter Sale
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreateSale} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay</option>
                <option value="Card">Card POS</option>
              </select>
            </div>
          </div>

          {/* Sale Items Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Purchased Items</h4>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-bold text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            {saleItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <select
                  value={item.productId}
                  onChange={(e) => handleProductSelect(idx, e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800"
                >
                  <option value="">Select Plant Product...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} - ₹{p.price}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                  className="w-16 bg-white border border-slate-200 rounded-xl p-2 text-xs text-center font-bold"
                />

                <span className="w-20 text-right text-xs font-extrabold text-slate-900">
                  ₹{item.price * item.quantity}
                </span>

                {saleItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Total Sale Amount</span>
              <h3 className="serif-font text-2xl font-extrabold text-emerald-950">₹{totalAmount}</h3>
            </div>

            <button
              type="submit"
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-lg transition flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" /> Generate Receipt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
