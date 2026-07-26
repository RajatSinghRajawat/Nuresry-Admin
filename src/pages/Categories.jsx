import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FolderTree, Edit3, Trash2 } from "lucide-react";
import { getAdminCategoriesApi, deleteCategoryApi } from "../utils/adminApi";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAdminCategoriesApi();
      setCategories(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategoryApi(id);
      setCategories(categories.filter((c) => c._id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Plant Taxonomy
          </span>
          <h1 className="serif-font text-3xl font-bold text-slate-900 mt-0.5">
            Nursery Categories
          </h1>
        </div>

        <Link
          to="/categories/new"
          className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-5 py-3 rounded-2xl transition flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-start gap-4"
            >
              <img
                src={cat.image || "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=200&q=80"}
                alt={cat.name}
                className="w-16 h-16 rounded-2xl object-cover bg-emerald-50 flex-shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                  <h3 className="serif-font font-bold text-slate-900 text-base">{cat.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{cat.description || "Botanical category"}</p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    {cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/categories/edit/${cat._id}`}
                      className="text-slate-500 hover:text-emerald-800 p-1"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
