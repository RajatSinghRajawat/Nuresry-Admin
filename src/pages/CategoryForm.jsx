// pages/CategoryForm.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

const CATEGORY_KINDS = ["Plants", "Tools", "Pots", "Seeds", "Care", "Decoration", "Other"];
const PLANT_SEGMENTS = ["", "Indoor", "Outdoor", "Flowering", "Bonsai", "Decoration", "FruitTrees", "Herbal", "Succulent", "Other"];

const emptyForm = () => ({
  Id: "",
  name: "",
  slug: "",
  description: "",
  kind: "Plants",
  plantSegment: "",
  parentCategory: "",
  isActive: true,
  subcategoriesText: "",
});

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isNew = !id || id === "new";

  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [parents, setParents] = useState([]);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const authJson = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadParents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json().catch(() => ({}));
      setParents(data.items || []);
    } catch {
      setParents([]);
    }
  }, []);

  const loadCategory = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`);
      const c = await res.json().catch(() => null);
      if (!res.ok || !c) {
        setError(c?.message || "Category not found");
        return;
      }
      const subText = Array.isArray(c.subcategories)
        ? c.subcategories.map((s) => s.name).join("\n")
        : "";
      setForm({
        Id: c.Id || "",
        name: c.name || "",
        slug: c.slug || "",
        description: c.description || "",
        kind: c.kind || "Plants",
        plantSegment: c.plantSegment || "",
        parentCategory: c.parentCategory?._id || c.parentCategory || "",
        isActive: c.isActive !== false,
        subcategoriesText: subText,
      });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  const parseSubcategories = () => {
    const lines = String(form.subcategoriesText || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.map((name) => ({ name }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = {
        Id: form.Id || undefined,
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description,
        kind: form.kind,
        plantSegment: form.plantSegment || "",
        parentCategory: form.parentCategory || null,
        subcategories: parseSubcategories(),
        isActive: form.isActive,
      };

      const url = isNew ? `${API_BASE}/api/categories` : `${API_BASE}/api/categories/${id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: authJson,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Save failed");
        return;
      }
      navigate("/categories");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-8 text-slate-500 font-medium">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <header className="flex justify-between items-start">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-700 mb-2">Taxonomy</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{isNew ? "New Category" : "Edit Category"}</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Build your nursery taxonomy by defining segments and collections.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/categories")}
          className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
        >
          Back to list
        </button>
      </header>

      {error && <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3">{error}</div>}

      <form className="space-y-6" onSubmit={handleSave}>
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-black text-slate-800">Identity & display</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 ml-1">Category name *</span>
              <input className="admin-input-flat" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 ml-1">URL slug</span>
              <input className="admin-input-flat" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 ml-1">Taxonomy kind</span>
              <select className="admin-input-flat" value={form.kind} onChange={(e) => set("kind", e.target.value)}>
                {CATEGORY_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 ml-1">Plant segment</span>
              <select className="admin-input-flat" value={form.plantSegment} onChange={(e) => set("plantSegment", e.target.value)}>
                {PLANT_SEGMENTS.map((s) => (
                  <option key={s || "none"} value={s}>
                    {s || "— None —"}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 ml-1">Id (optional)</span>
              <input className="admin-input-flat" value={form.Id} onChange={(e) => set("Id", e.target.value)} placeholder="CAT-ID" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 ml-1">Parent category</span>
              <select className="admin-input-flat" value={form.parentCategory} onChange={(e) => set("parentCategory", e.target.value)}>
                <option value="">— Root Category —</option>
                {parents
                  .filter((p) => String(p._id) !== String(id))
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2 pt-8 border-t border-slate-50">
            <span className="text-xs font-bold text-slate-500 ml-1">Category description</span>
            <textarea className="admin-input-flat" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 ml-1">Subcategories (one name per line)</span>
            <textarea className="admin-input-flat" rows={4} value={form.subcategoriesText} onChange={(e) => set("subcategoriesText", e.target.value)} />
          </label>
        </div>

        <div className="flex justify-between items-center bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 accent-emerald-600 rounded" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            <span className="text-sm font-black text-slate-600 uppercase tracking-tighter">Publish on Storefront</span>
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/categories")}
              className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all font-sans"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-12 py-4 bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-800 transition-all active:scale-95"
            >
              {saving ? "Processing..." : "Finish Category"}
            </button>
          </div>
        </div>
      </form>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .admin-input-flat {
          width: 100%;
          padding: 0.875rem 1rem;
          background: #f8fafc;
          border: 1.5px solid #f1f5f9;
          border-radius: 1rem;
          font-weight: 700;
          color: #334155;
          outline: none;
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }
        .admin-input-flat:focus {
          border-color: #059669;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.05);
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-bottom-2 { from { transform: translateY(0.5rem); } to { transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s ease-out, slide-in-from-bottom-2 0.3s ease-out; }
      `,
        }}
      />
    </div>
  );
}
