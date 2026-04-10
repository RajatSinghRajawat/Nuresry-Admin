// pages/ProductForm.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

const STOCK_STATUS = ["in_stock", "out_of_stock", "on_request"];
const DISCOUNT_TYPES = ["amount", "percent"];
const FLOWERING_TYPES = ["NA", "Flowering", "Non-Flowering"];
const HEIGHT_UNITS = ["cm", "inches"];

const emptyForm = () => ({
  name: "",
  sku: "",
  slug: "",
  categoryId: "",
  subcategoriesText: "",
  shortDescription: "",
  detailedDescription: "",
  highlightsText: "",
  plantType: "",
  botanicalName: "",
  commonName: "",
  heightValue: "",
  heightUnit: "cm",
  heightLabel: "",
  plantAge: "",
  mrp: "",
  price: "",
  discount: "0",
  discountType: "amount",
  gstPercent: "0",
  stock: "",
  stockStatus: "in_stock",
  minOrderQty: "1",
  growthType: "",
  sunlightRequirement: "",
  wateringSchedule: "",
  soilType: "",
  maintenanceLevel: "",
  airPurifying: false,
  floweringType: "NA",
  seasonalAvailability: "",
  imagesText: "",
  videoUrl: "",
  seoTitle: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywordsText: "",
  soldBy: "Nursery",
  responseRate: "95",
  reviewsEnabled: true,
  isActive: true,
});

const TABS = [
  { id: "overview", label: "Overview & copy" },
  { id: "pricing", label: "Pricing & stock" },
  { id: "plant", label: "Plant & care" },
  { id: "media", label: "Media" },
  { id: "seo", label: "SEO" },
];

function linesToArray(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildImages(form) {
  const all = linesToArray(form.imagesText);
  const uniq = [];
  for (const u of all) if (!uniq.includes(u)) uniq.push(u);
  return uniq;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isNew = !id || id === "new";

  const [tab, setTab] = useState("overview");
  const [form, setForm] = useState(emptyForm());
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [categories, setCategories] = useState([]);
  const [subcatOptions, setSubcatOptions] = useState([]);
  const [loadingSubcats, setLoadingSubcats] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const authHeader = { Authorization: `Bearer ${token}` };

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json().catch(() => ({}));
      setCategories(data.items || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadSubcategoriesForCategory = useCallback(async (categoryId) => {
    const idVal = String(categoryId || "").trim();
    if (!idVal) {
      setSubcatOptions([]);
      set("subcategoriesText", "");
      return;
    }

    const fromList = categories.find((c) => String(c?._id) === idVal);
    if (fromList && Array.isArray(fromList.subcategories)) {
      const opts = fromList.subcategories
        .map((s) => (typeof s === "string" ? s : s?.name))
        .map((s) => String(s || "").trim())
        .filter(Boolean);
      setSubcatOptions(opts);
      set("subcategoriesText", opts.join("\n"));
      return;
    }

    setLoadingSubcats(true);
    try {
      const res = await fetch(`${API_BASE}/api/categories/${idVal}`);
      const data = await res.json().catch(() => ({}));
      const opts = Array.isArray(data?.subcategories)
        ? data.subcategories
            .map((s) => (typeof s === "string" ? s : s?.name))
            .map((s) => String(s || "").trim())
            .filter(Boolean)
        : [];
      setSubcatOptions(opts);
      set("subcategoriesText", opts.join("\n"));
    } catch {
      setSubcatOptions([]);
      set("subcategoriesText", "");
    } finally {
      setLoadingSubcats(false);
    }
  }, [categories]);

  const loadProduct = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`);
      const p = await res.json().catch(() => null);
      if (!res.ok || !p) {
        setError(p?.message || "Product not found");
        return;
      }
      const imgs = Array.isArray(p.images) ? p.images : Array.isArray(p.image) ? p.image : [];
      setForm({
        ...emptyForm(),
        name: p.name || "",
        sku: p.sku || "",
        slug: p.slug || "",
        categoryId: p.categoryId?._id || p.categoryId || "",
        subcategoriesText: Array.isArray(p.subcategories) ? p.subcategories.join("\n") : "",
        shortDescription: p.shortDescription || "",
        detailedDescription: p.detailedDescription || p.description || "",
        highlightsText: Array.isArray(p.highlights) ? p.highlights.join("\n") : "",
        plantType: p.plantType || "",
        botanicalName: p.botanicalName || "",
        commonName: p.commonName || "",
        heightValue: p.heightValue != null ? String(p.heightValue) : "",
        heightUnit: p.heightUnit || "cm",
        heightLabel: p.heightLabel || "",
        plantAge: p.plantAge || "",
        mrp: p.mrp != null ? String(p.mrp) : "",
        price: p.price != null ? String(p.price) : "",
        discount: p.discount != null ? String(p.discount) : "0",
        discountType: p.discountType === "percent" ? "percent" : "amount",
        gstPercent: p.gstPercent != null ? String(p.gstPercent) : "0",
        stock: p.stock != null ? String(p.stock) : "",
        stockStatus: p.stockStatus || "in_stock",
        minOrderQty: p.minOrderQty != null ? String(p.minOrderQty) : "1",
        growthType: p.growthType || "",
        sunlightRequirement: p.sunlightRequirement || "",
        wateringSchedule: p.wateringSchedule || "",
        soilType: p.soilType || "",
        maintenanceLevel: p.maintenanceLevel || "",
        airPurifying: Boolean(p.airPurifying),
        floweringType: p.floweringType || "NA",
        seasonalAvailability: p.seasonalAvailability || "",
        imagesText: imgs.join("\n"),
        videoUrl: p.videoUrl || "",
        seoTitle: p.seoTitle || "",
        metaTitle: p.metaTitle || "",
        metaDescription: p.metaDescription || "",
        metaKeywordsText: Array.isArray(p.metaKeywords) ? p.metaKeywords.join(", ") : "",
        soldBy: p.soldBy || "Nursery",
        responseRate: p.responseRate != null ? String(p.responseRate) : "95",
        reviewsEnabled: p.reviewsEnabled !== false,
        isActive: p.isActive !== false,
      });

      setImagePreviews(imgs);
      setSelectedImageFiles([]);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    loadSubcategoriesForCategory(form.categoryId);
  }, [form.categoryId, loadSubcategoriesForCategory]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSelectedImageFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const previewToRemove = imagePreviews[index];
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));

    if (previewToRemove?.startsWith("blob:")) {
      URL.revokeObjectURL(previewToRemove);
    }
  };

  const slugFromName = () => {
    const s = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    set("slug", s);
  };

  const uploadFile = async (files) => {
    const list = Array.from(files || []).filter(Boolean);
    if (!list.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`${API_BASE}/api/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.message || "Upload failed");
          return;
        }
        if (data.url) {
          setForm((f) => {
            const existing = linesToArray(f.imagesText);
            const next = existing.includes(data.url) ? existing : [...existing, data.url];
            return { ...f, imagesText: next.join("\n") };
          });
        }
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = () => {
    const images = buildImages(form);
    const highlights = linesToArray(form.highlightsText);
    const subcategoriesText = linesToArray(form.subcategoriesText);
    const metaKeywords = linesToArray(form.metaKeywordsText.replace(/,/g, "\n"));
    return {
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      slug: form.slug.trim() || undefined,
      categoryId: form.categoryId || undefined,
      subcategoriesText,
      shortDescription: form.shortDescription,
      detailedDescription: form.detailedDescription,
      highlights,
      plantType: form.plantType,
      botanicalName: form.botanicalName,
      commonName: form.commonName,
      heightValue: form.heightValue === "" ? undefined : Number(form.heightValue),
      heightUnit: form.heightUnit,
      heightLabel: form.heightLabel,
      plantAge: form.plantAge,
      mrp: form.mrp === "" ? undefined : Number(form.mrp),
      price: Number(form.price),
      discount: Number(form.discount || 0),
      discountType: form.discountType,
      gstPercent: Number(form.gstPercent || 0),
      stock: Number(form.stock),
      stockStatus: form.stockStatus,
      minOrderQty: Math.max(1, Number(form.minOrderQty || 1)),
      growthType: form.growthType,
      sunlightRequirement: form.sunlightRequirement,
      wateringSchedule: form.wateringSchedule,
      soilType: form.soilType,
      maintenanceLevel: form.maintenanceLevel,
      airPurifying: form.airPurifying,
      floweringType: form.floweringType,
      seasonalAvailability: form.seasonalAvailability,
      videoUrl: form.videoUrl,
      images,
      seoTitle: form.seoTitle,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      metaKeywords,
      soldBy: form.soldBy || "Nursery",
      responseRate: Number(form.responseRate || 0),
      reviewsEnabled: form.reviewsEnabled,
      isActive: form.isActive,
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (imagePreviews.length === 0) {
      setError("Please add at least one image.");
      setTab("media");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      // Text fields
      formData.append("name", form.name.trim());
      formData.append("sku", form.sku.trim().toUpperCase());
      formData.append("slug", form.slug.trim());
      formData.append("categoryId", form.categoryId || "");
      formData.append("subcategories", JSON.stringify(linesToArray(form.subcategoriesText)));
      formData.append("shortDescription", form.shortDescription.trim());
      formData.append("detailedDescription", form.detailedDescription.trim());
      formData.append("highlights", JSON.stringify(linesToArray(form.highlightsText)));
      formData.append("plantType", form.plantType.trim());
      formData.append("botanicalName", form.botanicalName.trim());
      formData.append("commonName", form.commonName.trim());
      formData.append("heightValue", form.heightValue || "");
      formData.append("heightUnit", form.heightUnit);
      formData.append("heightLabel", form.heightLabel.trim());
      formData.append("plantAge", form.plantAge.trim());
      formData.append("mrp", form.mrp || "");
      formData.append("price", form.price || "0");
      formData.append("discount", form.discount || "0");
      formData.append("discountType", form.discountType);
      formData.append("gstPercent", form.gstPercent || "0");
      formData.append("stock", form.stock || "0");
      formData.append("stockStatus", form.stockStatus);
      formData.append("minOrderQty", form.minOrderQty || "1");
      formData.append("growthType", form.growthType.trim());
      formData.append("sunlightRequirement", form.sunlightRequirement.trim());
      formData.append("wateringSchedule", form.wateringSchedule.trim());
      formData.append("soilType", form.soilType.trim());
      formData.append("maintenanceLevel", form.maintenanceLevel.trim());
      formData.append("airPurifying", form.airPurifying);
      formData.append("floweringType", form.floweringType);
      formData.append("seasonalAvailability", form.seasonalAvailability.trim());
      formData.append("videoUrl", form.videoUrl.trim());
      formData.append("seoTitle", form.seoTitle.trim());
      formData.append("metaTitle", form.metaTitle.trim());
      formData.append("metaDescription", form.metaDescription.trim());
      formData.append("metaKeywords", JSON.stringify(linesToArray(form.metaKeywordsText.replace(/,/g, "\n"))));
      formData.append("soldBy", form.soldBy || "Nursery");
      formData.append("responseRate", form.responseRate || "95");
      formData.append("reviewsEnabled", form.reviewsEnabled);
      formData.append("isActive", form.isActive);

      // Existing images (URLs)
      const existingImages = linesToArray(form.imagesText);
      formData.append("existingImages", JSON.stringify(existingImages));

      // New image files
      selectedImageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const url = isNew
        ? `${API_BASE}/api/products/add`
        : `${API_BASE}/api/products/${id}`;

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: authHeader,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Failed to save product");
        return;
      }

      navigate("/products");
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-8 text-slate-500 font-medium">Loading product…</div>;
  }

  return (
    <div className="admin-page admin-page--wide max-w-6xl mx-auto p-8">
      <header className="flex justify-between items-start mb-10">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-700 mb-2">Catalogue</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {isNew ? "New Product" : "Edit Product"}
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Structured data for nursery / plant commerce
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
        >
          Back to list
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-8" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${
              tab === t.id
                ? "bg-emerald-950 text-white shadow-lg"
                : "bg-slate-100/80 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form className="space-y-6" onSubmit={handleSave}>
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-10">
          {/* ==================== OVERVIEW TAB ==================== */}
          {tab === "overview" && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-slate-800">Identity & Descriptions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Product Name</span>
                  <input
                    className="admin-input-flat"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Snake Plant – Indoor Air Purifier"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">SKU</span>
                  <input
                    className="admin-input-flat uppercase"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value.toUpperCase())}
                    placeholder="PLT-SNKE-001"
                    required
                  />
                </label>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">URL Slug</span>
                  <div className="flex gap-2">
                    <input
                      className="admin-input-flat flex-1"
                      value={form.slug}
                      onChange={(e) => set("slug", e.target.value)}
                      placeholder="snake-plant-indoor"
                    />
                    <button
                      type="button"
                      onClick={slugFromName}
                      className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-slate-50"
                    >
                      From Name
                    </button>
                  </div>
                </div>

                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Category</span>
                  <select
                    className="admin-input-flat cursor-pointer"
                    value={form.categoryId}
                    onChange={(e) => {
                      set("categoryId", e.target.value);
                      set("subcategoriesText", "");
                    }}
                  >
                    <option value="">— Select Category —</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Subcategories</span>
                  <div className="flex flex-col gap-2">
                    <select
                      className="admin-input-flat cursor-pointer"
                      multiple
                      disabled={!form.categoryId || loadingSubcats}
                      value={linesToArray(form.subcategoriesText)}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                        set("subcategoriesText", selected.join("\n"));
                      }}
                      size={Math.min(8, Math.max(3, subcatOptions.length))}
                    >
                      {subcatOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!form.categoryId || loadingSubcats}
                        onClick={() => set("subcategoriesText", subcatOptions.join("\n"))}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-slate-50 disabled:opacity-50"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => set("subcategoriesText", "")}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-slate-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </label>

                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Short Description</span>
                  <textarea className="admin-input-flat" rows={3} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
                </label>

                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Detailed Description</span>
                  <textarea className="admin-input-flat" rows={8} value={form.detailedDescription} onChange={(e) => set("detailedDescription", e.target.value)} />
                </label>

                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Key Features (one per line)</span>
                  <textarea className="admin-input-flat" rows={4} value={form.highlightsText} onChange={(e) => set("highlightsText", e.target.value)} placeholder="Low maintenance&#10;Air purifying" />
                </label>
              </div>
            </div>
          )}

          {/* ==================== PRICING TAB ==================== */}
          {tab === "pricing" && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-slate-800">Pricing, Tax & Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">MRP (₹)</span>
                  <input type="number" className="admin-input-flat" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Selling Price (₹)</span>
                  <input type="number" className="admin-input-flat" required value={form.price} onChange={(e) => set("price", e.target.value)} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Discount</span>
                  <div className="flex gap-1">
                    <input type="number" className="admin-input-flat flex-1" value={form.discount} onChange={(e) => set("discount", e.target.value)} />
                    <select className="admin-input-flat w-28" value={form.discountType} onChange={(e) => set("discountType", e.target.value)}>
                      {DISCOUNT_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">GST %</span>
                  <input type="number" className="admin-input-flat" value={form.gstPercent} onChange={(e) => set("gstPercent", e.target.value)} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Stock Quantity</span>
                  <input type="number" className="admin-input-flat" required value={form.stock} onChange={(e) => set("stock", e.target.value)} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Stock Status</span>
                  <select className="admin-input-flat" value={form.stockStatus} onChange={(e) => set("stockStatus", e.target.value)}>
                    {STOCK_STATUS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex gap-8 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-emerald-600" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                  <span className="text-sm font-bold text-slate-600">Published on Storefront</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-emerald-600" checked={form.reviewsEnabled} onChange={(e) => set("reviewsEnabled", e.target.checked)} />
                  <span className="text-sm font-bold text-slate-600">Enable Reviews</span>
                </label>
              </div>
            </div>
          )}

          {/* ==================== PLANT TAB ==================== */}
          {tab === "plant" && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-slate-800">Plant Attributes & Care</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Plant Type</span>
                  <input className="admin-input-flat" value={form.plantType} onChange={(e) => set("plantType", e.target.value)} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Flowering</span>
                  <select className="admin-input-flat" value={form.floweringType} onChange={(e) => set("floweringType", e.target.value)}>
                    {FLOWERING_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Botanical Name</span>
                  <input className="admin-input-flat italic" value={form.botanicalName} onChange={(e) => set("botanicalName", e.target.value)} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Common Name</span>
                  <input className="admin-input-flat" value={form.commonName} onChange={(e) => set("commonName", e.target.value)} />
                </label>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Height</span>
                  <div className="flex gap-2">
                    <input type="number" className="admin-input-flat flex-1" value={form.heightValue} onChange={(e) => set("heightValue", e.target.value)} />
                    <select className="admin-input-flat w-28" value={form.heightUnit} onChange={(e) => set("heightUnit", e.target.value)}>
                      {HEIGHT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Plant Age</span>
                  <input className="admin-input-flat" value={form.plantAge} onChange={(e) => set("plantAge", e.target.value)} />
                </label>

                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Sunlight Requirement</span>
                  <input className="admin-input-flat" value={form.sunlightRequirement} onChange={(e) => set("sunlightRequirement", e.target.value)} />
                </label>
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Watering Schedule</span>
                  <input className="admin-input-flat" value={form.wateringSchedule} onChange={(e) => set("wateringSchedule", e.target.value)} />
                </label>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-emerald-600" checked={form.airPurifying} onChange={(e) => set("airPurifying", e.target.checked)} />
                <span className="text-sm font-bold text-slate-600">Air Purifying Plant</span>
              </label>
            </div>
          )}

          {/* ==================== MEDIA TAB (Image Upload) ==================== */}
          {tab === "media" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-black text-slate-800">Images & video</h2>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 ml-1">Upload image (stores URL from server)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={(e) => uploadFile(e.target.files)}
                  className="text-sm font-semibold"
                />
                {uploading && <span className="text-xs text-emerald-600 font-bold">Uploading…</span>}
              </label>
              <div className="space-y-6">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Images (one URL per line)</span>
                  <textarea className="admin-input-flat" rows={6} value={form.imagesText} onChange={(e) => set("imagesText", e.target.value)} placeholder="https://..." />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Video URL</span>
                  <input className="admin-input-flat" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
                </label>
              </div>

             

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 ml-1">Video URL (YouTube, etc.)</span>
                <input
                  className="admin-input-flat"
                  value={form.videoUrl}
                  onChange={(e) => set("videoUrl", e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </label>
            </div>
          )}

          {/* ==================== SEO TAB ==================== */}
          {tab === "seo" && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-slate-800">SEO & Merchandising</h2>
              <div className="space-y-6">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 ml-1">Merchandising / SEO Title</span>
                  <input className="admin-input-flat" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                  <div className="space-y-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-500 ml-1">Meta Title</span>
                      <input className="admin-input-flat" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-500 ml-1">Meta Keywords (comma or new line)</span>
                      <textarea className="admin-input-flat" rows={3} value={form.metaKeywordsText} onChange={(e) => set("metaKeywordsText", e.target.value)} />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-500 ml-1">Meta Description</span>
                    <textarea className="admin-input-flat" rows={8} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 sticky bottom-8 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-12 py-3.5 bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-800 active:scale-95 transition-all"
          >
            {saving ? "Saving Product..." : "Save Product"}
          </button>
        </div>
      </form>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .admin-input-flat {
              width: 100%;
              padding: 0.875rem 1rem;
              background: #fff;
              border: 1.5px solid #e2e8f0;
              border-radius: 0.75rem;
              font-weight: 600;
              color: #334155;
              outline: none;
              transition: all 0.2s ease;
              font-size: 0.875rem;
            }
            .admin-input-flat:focus {
              border-color: #064e3b;
              background: #fdfdfd;
            }
            .admin-input-flat::placeholder {
              color: #cbd5e1;
            }
          `,
        }}
      />
    </div>
  );
}