import React, { useEffect, useState } from "react";
import { ShoppingBag, Search, Eye, Truck, CheckCircle2, Clock, X } from "lucide-react";
import { getAdminOrdersApi, updateOrderStatusApi } from "../utils/adminApi";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const data = await getAdminOrdersApi();
      setOrders(data);
      setLoading(false);
    }
    loadOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await updateOrderStatusApi(id, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder?._id === id) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Fulfillment Center
          </span>
          <h1 className="serif-font text-3xl font-bold text-slate-900 mt-0.5">
            Customer Orders Lifecycle
          </h1>
        </div>

        <div className="flex gap-2">
          {["all", "Processing", "Shipped", "Delivered"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? "bg-emerald-800 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st === "all" ? "All Orders" : st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4 font-bold">Order ID</th>
                  <th className="py-3.5 px-4 font-bold">Customer Name</th>
                  <th className="py-3.5 px-4 font-bold">Date Placed</th>
                  <th className="py-3.5 px-4 font-bold">Payment</th>
                  <th className="py-3.5 px-4 font-bold">Total Amount</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">#{order._id}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {order.customerName || order.shippingAddress?.fullName || "Verified Buyer"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN")
                        : "2026-07-26"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-600">{order.paymentMethod || "COD"}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-950">₹{order.totalAmount}</td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="serif-font font-bold text-lg text-slate-900">
                  Order Details #{selectedOrder._id}
                </h3>
                <span className="text-xs text-slate-400">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN") : "Today"}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Customer Shipping Address</h4>
                <p className="font-bold text-slate-900">{selectedOrder.shippingAddress?.fullName || selectedOrder.customerName}</p>
                <p className="text-slate-600">{selectedOrder.shippingAddress?.address || "Delivery Address"}</p>
                <p className="text-slate-600">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </p>
                <p className="text-emerald-800 font-bold mt-1">Phone: {selectedOrder.shippingAddress?.phone || "+91 98765 43210"}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl">
                      <span className="font-bold text-slate-900">{item.name} x {item.quantity}</span>
                      <span className="font-extrabold text-emerald-950">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-sm font-extrabold text-slate-900">
                <span>Grand Total Paid ({selectedOrder.paymentMethod || "COD"})</span>
                <span className="text-emerald-800">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
