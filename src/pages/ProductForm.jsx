import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Upload, Sparkles, Plus } from "lucide-react";
import { addProductApi, updateProductApi, getAdminCategoriesApi, getAdminProductsApi } from "../utils/adminApi";

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "Indoor Plants",
    stock: 20,
    careLevel: "Easy",
    lightRequirement: "Bright Indirect Light",
    waterRequirement: "Once a week",
    petFriendly: false,
    description: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      const cats = await getAdminCategoriesApi();
      setCategories(cats);

      if (isEdit) {
        const prods = await getAdminProductsApi();
        const found = prods.find((p) => p._id === id);
        if (found) {
          setFormData({
            name: found.name || "",
            price: found.price || "",
            originalPrice: found.originalPrice || "",
            category: found.category || "Indoor Plants",
            stock: found.stock || 20,
            careLevel: found.careLevel || "Easy",
            lightRequirement: found.lightRequirement || "Bright Indirect Light",
            waterRequirement: found.waterRequirement || "Once a week",
            petFriendly: found.petFriendly || false,
            description: found.description || "",
          });
          if (found.images?.length > 0) {
            setImagePreviews(found.images);
          }
        }
      }
    }
    loadInitialData();
  }, [id, isEdit]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const body = new FormData();
    Object.keys(formData).forEach((key) => {
      body.append(key, formData[key]);
    });

    images.forEach((file) => {
      body.append("images", file);
    });

    try {
      if (isEdit) {
        await updateProductApi(id, formData);
      } else {
        await addProductApi(body);
      }
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate("/products"), 1200);
    } catch (err) {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate("/products"), 1200);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/products" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            {isEdit ? "Modify Inventory" : "New Botanical Entry"}
          </span>
          <h1 className="serif-font text-2xl font-bold text-slate-900 mt-0.5">
            {isEdit ? "Edit Plant Product" : "Add Plant Product to Shop"}
          </h1>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl">
          ✓ Plant product saved successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        
        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Plant / Product Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Monstera Deliciosa"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="Indoor Plants">Indoor Plants</option>
              <option value="Outdoor Plants">Outdoor Plants</option>
              <option value="Pots & Planters">Pots & Planters</option>
              <option value="Gardening Tools">Gardening Tools</option>
              <option value="Plant Care">Plant Care</option>
              <option value="Seeds & Bulbs">Seeds & Bulbs</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹)</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              placeholder="899"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹)</label>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
              placeholder="1199"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Stock Units</label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              placeholder="25"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Environmental Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Care Difficulty</label>
            <select
              value={formData.careLevel}
              onChange={(e) => setFormData({ ...formData, careLevel: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="Easy">Easy Care</option>
              <option value="Beginner Friendly">Beginner Friendly</option>
              <option value="Medium">Medium Care</option>
              <option value="Expert">Expert Gardener</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sunlight Need</label>
            <input
              type="text"
              value={formData.lightRequirement}
              onChange={(e) => setFormData({ ...formData, lightRequirement: e.target.value })}
              placeholder="e.g. Bright Indirect Light"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Watering Routine</label>
            <input
              type="text"
              value={formData.waterRequirement}
              onChange={(e) => setFormData({ ...formData, waterRequirement: e.target.value })}
              placeholder="e.g. Once a week"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Pet Friendly Toggle */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="petFriendly"
            checked={formData.petFriendly}
            onChange={(e) => setFormData({ ...formData, petFriendly: e.target.checked })}
            className="w-4 h-4 accent-emerald-600 rounded"
          />
          <label htmlFor="petFriendly" className="text-xs font-bold text-slate-700 cursor-pointer">
            100% Non-Toxic & Pet Friendly Plant
          </label>
        </div>

        {/* Images Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Plant Photos</label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">Click or drag images to upload</p>
            <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
          </div>

          {imagePreviews.length > 0 && (
            <div className="flex gap-3 mt-3 overflow-x-auto">
              {imagePreviews.map((src, i) => (
                <img key={i} src={src} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description & Overview</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Botanical specifications, leaf shape, origin, potting notes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" /> {submitting ? "Saving Product..." : "Save Product"}
          </button>
        </div>

      </form>
    </div>
  );
}