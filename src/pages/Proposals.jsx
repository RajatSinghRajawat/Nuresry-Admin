import React, { useEffect, useState } from "react";
import {
  LuPlus, LuRefreshCw, LuTrash2, LuX, LuDownload, LuSave
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

export default function Proposals() {
  const { token, isSuperAdmin } = useAuth();

  const [proposals, setProposals] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    client: {
      name: "",
      email: "",
      phone: "",
      address: "",
      shipToAddress: "",
    },
    items: [
      {
        itemName: "",
        category: "",
        subCategory: "",
        itemDescription: "",
        quantity: 1,
        rate: null,
        hsnCode: "",
      },
    ],
    gstEnabled: true,
    termsAndConditions: "No return policy",
    note: "Urgent delivery",
  });

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const toArray = (data, preferredKey) => {
    if (Array.isArray(data)) return data;
    if (preferredKey && Array.isArray(data?.[preferredKey])) return data[preferredKey];
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.proposals)) return data.proposals;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const getallUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/getAllusers`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      console.log("All users:", data);
      setUsers(toArray(data, "users"));
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    }
  }

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products?limit=500`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      setProducts(toArray(data, "items"));
      console.log("Fetched products:", data.items);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    }
  };
  console.log("products", products);

  const getProductCategoryLabel = (product) => {
    const segment = product?.categoryId?.plantSegment;
    const categoryName = product?.categoryId?.name;
    return segment || categoryName || "Uncategorized";
  };

  const filteredProducts = products.filter((product) => {
    if (productCategoryFilter === "all") return true;
    const segment = String(product?.categoryId?.plantSegment || "").toLowerCase();
    const categoryName = String(product?.categoryId?.name || "").toLowerCase();
    return segment === productCategoryFilter || categoryName === productCategoryFilter;
  });

  const getSubCategoryOptions = (item) => {
    const selectedProduct = products.find((p) => p.name === item.itemName);
    if (selectedProduct?.subcategoriesText?.length) return selectedProduct.subcategoriesText;
    return [];
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      setCategories(toArray(data, "items"));
      console.log("Fetched Categories:", data.items);
    } catch (err) {
      console.error("Failed to fetch Categories:", err);
      setCategories([]);
    }
  };
  console.log("Categories", categories);

  // Fetch Proposals
  const fetchProposals = async () => {
    setLoading(true);
    try {
      // const query = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${API_BASE}/api/proposals?page=1&limit=10`, {
        headers: getHeaders(),
      });

      const data = await res.json();


      setProposals(toArray(data, "proposals"));
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };


  // Delete Proposal
  const deleteProposal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this proposal?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/proposals/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (res.ok) {
        setProposals((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert("Failed to delete proposal");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateProposalStatus = async (proposal) => {
    if (!proposal?._id) return;
    const currentStatus = proposal.status || "Draft";
    const nextStatus = window.prompt(
      "Enter new status (Draft, Sent, Approved, Rejected):",
      currentStatus
    );

    if (!nextStatus || nextStatus.trim() === currentStatus) return;

    try {
      const res = await fetch(`${API_BASE}/api/proposals/${proposal._id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status: nextStatus.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Failed to update proposal");
        return;
      }

      setProposals((prev) =>
        prev.map((item) =>
          item._id === proposal._id ? { ...item, ...data.proposal } : item
        )
      );
    } catch (err) {
      console.error("Update proposal failed:", err);
      alert("Error updating proposal");
    }
  };

  // Create Proposal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client.name?.trim()) {
      alert("Client name is required");
      return;
    }
    if (!selectedUserId) {
      alert("Please select an existing client from dropdown.");
      return;
    }

    setSubmitting(true);

    const formattedItems = formData.items.map((item) => {
      const product = products.find((p) => p.name === item.itemName);
      return {
        product: product?._id || null,
        category: item.category,
        subCategory: item.subCategory,
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || null,
        description: item.itemDescription || "",
        hsnCode: item.hsnCode || "06029090",
      };
    });

    const payload = {
      user: selectedUserId,
      clientName: formData.client.name,
      emailId: formData.client.email,
      contactNumber: formData.client.phone,
      address: formData.client.address,
      shipToAddress: formData.client.shipToAddress,
      description: formData.description,
      items: formattedItems,
      gst: formData.gstEnabled,
      termsAndConditions: formData.termsAndConditions,
      note: formData.note,
    };

    try {
      const res = await fetch(`${API_BASE}/api/proposals/createProposals`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Proposal created successfully!");
        setShowModal(false);
        // Reset form
        setFormData({
          date: new Date().toISOString().split("T")[0],
          description: "",
          client: { name: "", email: "", phone: "", address: "", shipToAddress: "" },
          items: [{ itemName: "", category: "", subCategory: "", itemDescription: "", quantity: 1, rate: null, hsnCode: "" }],
          gstEnabled: true,
          termsAndConditions: "No return policy",
          note: "Urgent delivery",
        });
        setSelectedUserId("");
        fetchProposals();
      } else {
        alert(result.message || "Failed to create proposal");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating proposal");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== FIXED HANDLERS ====================
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { itemName: "", category: "", subCategory: "", itemDescription: "", quantity: 1, rate: null, hsnCode: "" },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      if (field === "itemName") {
        const selectedProduct = products.find((p) => p.name === value);
        if (selectedProduct) {
          updatedItems[index].category = getProductCategoryLabel(selectedProduct);
          if (
            Array.isArray(selectedProduct.subcategoriesText) &&
            selectedProduct.subcategoriesText.length > 0
          ) {
            updatedItems[index].subCategory = selectedProduct.subcategoriesText[0];
          } else {
            updatedItems[index].subCategory = "";
          }
          if (!updatedItems[index].rate && Number(selectedProduct.price || 0) > 0) {
            updatedItems[index].rate = Number(selectedProduct.price || 0);
          }
        } else {
          updatedItems[index].category = "";
          updatedItems[index].subCategory = "";
        }
      }
      return { ...prev, items: updatedItems };
    });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );
    const gst = formData.gstEnabled ? subtotal * 0.18 : 0;
    return Math.round(subtotal + gst);
  };

  // Load data
  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchCategories();
      fetchProposals();
      getallUsers();
    }
  }, [token, search]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-700">Contracting</p>
            {loading && <LuRefreshCw className="animate-spin text-emerald-600" size={14} />}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Greenbeli Proposals
          </h1>
          <p className="text-slate-500 font-medium text-sm">Create and manage formal B2B plant supply quotes.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-6 py-4 bg-emerald-950 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-950/20"
        >
          <LuPlus /> Create New Proposal
        </button>
      </header>

      {/* Proposals Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Proposal ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">

              {proposals.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-slate-400">
                    No proposals found
                  </td>
                </tr>
              )}

              {Array.isArray(proposals) && proposals.map((p) => {
                const subtotal =
                  p.items?.reduce(
                    (sum, item) =>
                      sum +
                      (Number(item.quantity) || 0) *
                      (Number(item.rate) || 0),
                    0
                  ) || 0;

                const totalAmount = p.gst
                  ? Math.round(subtotal * 1.18)
                  : subtotal;

                return (
                  <tr key={p._id} className="group hover:bg-slate-50/50 transition-all">

                    <td className="px-8 py-6">
                      <span className="font-black text-emerald-800 text-xs">
                        #{p.proposalId || p._id.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">
                        {p.clientName || "Unknown Client"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">
                        {p.emailId} {p.contactNumber && `• ${p.contactNumber}`}
                      </p>
                    </td>

                    <td className="px-8 py-6 font-bold text-slate-700">
                      ₹{(totalAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
                        {p.status || "Draft"}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                          <LuDownload size={18} />
                        </button>
                        <button
                          onClick={() => updateProposalStatus(p)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold"
                          title="Update status"
                        >
                          Edit
                        </button>

                        {isSuperAdmin && (
                          <button
                            onClick={() => deleteProposal(p._id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <LuTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[3rem] shadow-2xl ml-20 overflow-hidden">
            <div className="max-h-[92vh] overflow-y-auto">

              <div className="sticky top-0 bg-white/95 backdrop-blur-md px-10 py-6 border-b border-slate-100 flex items-center justify-between z-10">
                <h2 className="text-2xl font-black text-slate-900">New Greenbeli Proposal</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <LuX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-12">
                {/* Date & Description */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                    <input
                      placeholder="E.g. Landscaping project for XYZ Hotel"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Client Information */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700 flex items-center gap-2">
                    <div className="w-1 h-4 bg-emerald-600 rounded-full" /> Client Information
                  </h3>
                  <div>
                    <select
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500 mb-2"
                      onChange={(e) => {
                        const selectedUser = users.find((u) => u._id === e.target.value);
                        if (selectedUser) {
                          setSelectedUserId(selectedUser._id);
                          let addressStr = "";
                          if (selectedUser.address) {
                            if (typeof selectedUser.address === 'object') {
                              const { street, city, state, postalCode, country } = selectedUser.address;
                              addressStr = [street, city, state, postalCode, country].filter(Boolean).join(", ");
                            } else {
                              addressStr = selectedUser.address;
                            }
                          }

                          setFormData(prev => ({
                            ...prev,
                            client: {
                              ...prev.client,
                              name: selectedUser.name || "",
                              email: selectedUser.email || "",
                              phone: selectedUser.phone || prev.client.phone,
                              address: addressStr || prev.client.address
                            }
                          }));
                        }
                      }}
                      value={selectedUserId}
                    >
                      <option value="">Select Existing Client</option>
                      {Array.isArray(users) && users.map((u) => (
                        <option key={u._id} value={u._id}>{u.name} - {u.email}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <input
                      placeholder="Client Name *"
                      value={formData.client.name}
                      onChange={(e) => setFormData({ ...formData, client: { ...formData.client, name: e.target.value } })}
                      className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                      required
                    />
                    <input
                      placeholder="Email ID"
                      type="email"
                      value={formData.client.email}
                      onChange={(e) => setFormData({ ...formData, client: { ...formData.client, email: e.target.value } })}
                      className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                    />
                    <input
                      placeholder="Contact Number"
                      value={formData.client.phone}
                      onChange={(e) => setFormData({ ...formData, client: { ...formData.client, phone: e.target.value } })}
                      className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                    />
                    <textarea
                      placeholder="Billing Address"
                      rows="2"
                      value={formData.client.address}
                      onChange={(e) => setFormData({ ...formData, client: { ...formData.client, address: e.target.value } })}
                      className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500 md:col-span-2"
                    />
                    <textarea
                      placeholder="Ship To Address"
                      rows="2"
                      value={formData.client.shipToAddress}
                      onChange={(e) => setFormData({ ...formData, client: { ...formData.client, shipToAddress: e.target.value } })}
                      className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700 flex items-center gap-2">
                      <div className="w-1 h-4 bg-emerald-600 rounded-full" /> Items & Rates
                    </h3>
                    <div className="flex items-center gap-3">
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700"
                      >
                        <option value="all">All Products</option>
                        <option value="flowering">Flowering</option>
                        <option value="indoor">Indoor</option>
                        <option value="outdoor">Outdoor</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="text-xs font-black text-emerald-700 hover:underline"
                      >
                        + Add Row
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="p-6 bg-slate-50/70 rounded-3xl border border-slate-100 space-y-4">

                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Item Name</label>
                            <select
                              value={item.itemName}
                              onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                              className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                              required
                            >
                              <option value="">Select Product</option>
                              {filteredProducts.map((p) => (
                                <option key={p._id} value={p.name}>{p.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-3">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Category</label>
                            <select
                              value={item.category}
                              onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                              className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                              required
                            >
                              <option value="">Select Category</option>
                              {categories.map((c) => (
                                <option key={c._id} value={c.plantSegment || c.name}>{c.plantSegment || c.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-3">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Sub Category</label>
                            <select
                              value={item.subCategory}
                              onChange={(e) => handleItemChange(idx, "subCategory", e.target.value)}
                              className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                              required
                            >
                              <option value="">Select Sub Category</option>
                              {getSubCategoryOptions(item).map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-3">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Description</label>
                            <input
                              value={item.itemDescription}
                              onChange={(e) => handleItemChange(idx, "itemDescription", e.target.value)}
                              className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                              placeholder="e.g. Notification"
                            />
                          </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                              className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-center"
                            />
                          </div>

                          <div className="md:col-span-4">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Rate (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={item.rate}
                              onChange={(e) => handleItemChange(idx, "rate", parseFloat(e.target.value) || null)}
                              className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                              placeholder="e.g. ₹120"
                            />
                          </div>

                          <div className="md:col-span-4">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">HSN Code</label>
                            <input
                              value={item.hsnCode}
                              onChange={(e) => handleItemChange(idx, "hsnCode", e.target.value)}
                              className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                              placeholder="e.g. 06XXXX90"
                            />
                          </div>

                          <div className="md:col-span-2 flex items-end justify-center pb-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-2"
                            >
                              <LuTrash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Taxes & Footer */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                      <div
                        onClick={() => setFormData({ ...formData, gstEnabled: !formData.gstEnabled })}
                        className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${formData.gstEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.gstEnabled ? 'left-7' : 'left-1'}`} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-900 uppercase">GST (18%)</p>
                        <p className="text-[10px] font-bold text-emerald-700">Apply tax to total amount</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terms and Conditions</label>
                        <textarea
                          rows="4"
                          value={formData.termsAndConditions}
                          onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note</label>
                        <textarea
                          rows="2"
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500 mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Summary */}
                  <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        <span>Subtotal</span>
                        <span>₹{formData.items.reduce((s, i) => s + (Number(i.quantity) * Number(i.rate)), 0).toLocaleString('en-IN')}</span>
                      </div>
                      {formData.gstEnabled && (
                        <div className="flex justify-between text-emerald-400 font-bold uppercase text-[10px] tracking-widest">
                          <span>GST (18%)</span>
                          <span>₹{Math.round(formData.items.reduce((s, i) => s + (Number(i.quantity) * Number(i.rate)), 0) * 0.18).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-white/50">Total Amount</span>
                        <span className="text-4xl font-black text-emerald-400 tracking-tighter">
                          ₹{calculateTotal().toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-10 w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-300 text-slate-950 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                    >
                      <LuSave size={20} /> {submitting ? "Saving..." : "Save Proposal"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

      )}
    </div>
  );
}