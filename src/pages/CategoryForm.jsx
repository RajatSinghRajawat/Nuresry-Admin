import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { createCategoryApi, updateCategoryApi, getAdminCategoriesApi } from "../utils/adminApi";

export default function CategoryForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getAdminCategoriesApi().then((cats) => {
        const found = cats.find((c) => c._id === id);
        if (found) {
          setName(found.name || "");
          setDescription(found.description || "");
          setImage(found.image || "");
        }
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const payload = { name, slug, description, image };

    try {
      if (isEdit) {
        await updateCategoryApi(id, payload);
      } else {
        await createCategoryApi(payload);
      }
      setSubmitting(false);
      navigate("/categories");
    } catch (e) {
      setSubmitting(false);
      navigate("/categories");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/categories" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Categories
      </Link>

      <h1 className="serif-font text-2xl font-bold text-slate-900">
        {isEdit ? "Edit Category" : "Add New Category"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Terracotta Planters"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category overview and features..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-900 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {submitting ? "Saving..." : "Save Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
