import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit3, Trash2, Sprout, Filter } from "lucide-react";
import { getAdminProductsApi, deleteProductApi } from "../utils/adminApi";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAdminProductsApi();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plant product?")) {
      try {
        await deleteProductApi(id);
        setProducts(products.filter((p) => p._id !== id));
      } catch (e) {
        setProducts(products.filter((p) => p._id !== id));
      }
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Inventory Management
          </span>
          <h1 className="serif-font text-3xl font-bold text-slate-900 mt-0.5">
            Plant Catalog Products
          </h1>
        </div>

        <Link
          to="/products/new"
          className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-5 py-3 rounded-2xl transition flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New Plant Product
        </Link>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by plant name or category..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filtered.length} products
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading products catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Sprout className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="serif-font text-lg font-bold text-slate-800">No products found</h3>
            <Link to="/products/new" className="bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl inline-block">
              Add First Plant Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4 font-bold">Plant Image</th>
                  <th className="py-3.5 px-4 font-bold">Product Name</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Price</th>
                  <th className="py-3.5 px-4 font-bold">Stock Amount</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <img
                        src={p.images?.[0] || p.image || "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=200&q=80"}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-emerald-50"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-emerald-800 font-semibold">{p.category || "Indoor Plants"}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">₹{p.price}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        (p.stock || 10) < 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {p.stock || 10} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/products/edit/${p._id}`)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
