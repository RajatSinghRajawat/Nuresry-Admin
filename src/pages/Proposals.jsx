import React, { useEffect, useState, useCallback } from "react";
import { 
  LuFileText, LuPlus, LuSearch, LuRefreshCw, LuTrash2, 
  LuChevronDown, LuSave, LuX, LuDownload, LuPrinter 
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

export default function Proposals() {
  const { token, isSuperAdmin } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    client: { name: '', email: '', phone: '', address: '', shipToAddress: '' },
    description: '',
    items: [{ itemName: '', itemDescription: '', quantity: 1, rate: 0, hsnCode: '06029090' }],
    gstEnabled: false,
    termsAndConditions: "1. Validity: 30 Days\n2. Payment: 50% Advance\n3. Delivery: extra as applicable",
    note: ''
  });

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProposals(data);
    } catch (err) {
      console.error("Fetch proposals error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
    fetchProducts();
  }, [fetchProposals, fetchProducts]);

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    if (formData.gstEnabled) {
      return subtotal + (subtotal * 0.18);
    }
    return subtotal;
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemName: '', itemDescription: '', quantity: 1, rate: 0, hsnCode: '06029090' }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // If item selected from dropdown, pre-fill rate and description
    if (field === 'itemName') {
      const prod = products.find(p => p.name === value);
      if (prod) {
        newItems[index].rate = prod.price;
        newItems[index].itemDescription = prod.shortDescription || '';
      }
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, totalAmount: calculateTotal() };
    
    try {
      const res = await fetch(`${API_BASE}/api/proposals`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowModal(false);
        fetchProposals();
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          client: { name: '', email: '', phone: '', address: '', shipToAddress: '' },
          description: '',
          items: [{ itemName: '', itemDescription: '', quantity: 1, rate: 0, hsnCode: '06029090' }],
          gstEnabled: false,
          termsAndConditions: "1. Validity: 30 Days\n2. Payment: 50% Advance\n3. Delivery: extra as applicable",
          note: ''
        });
      }
    } catch (err) {
      console.error("Submit proposal error:", err);
    }
  };

  const deleteProposal = async (id) => {
    if (!window.confirm("Delete this proposal?")) return;
    try {
      await fetch(`${API_BASE}/api/proposals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProposals();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
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

      {/* List View */}
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
              {proposals.map((p) => (
                <tr key={p._id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6 font-black text-emerald-800">{p.proposalId}</td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900">{p.client?.name || "Unknown Client"}</p>
                    <p className="text-[10px] font-bold text-slate-400">{p.client?.email || "No Email"}</p>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-700">₹{(p.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><LuDownload size={18} /></button>
                       {isSuperAdmin && (
                         <button onClick={() => deleteProposal(p._id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><LuTrash2 size={18} /></button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-6 border-b border-slate-100 flex items-center justify-between z-10">
              <h2 className="text-2xl font-black text-slate-900">New Greenbeli Proposal</h2>
              <button onClick={() => setShowModal(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                <LuX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-12">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">General Description</label>
                   <input 
                    placeholder="E.g. Landscaping for XYZ Hotel"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Client Section */}
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700 flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-600 rounded-full" /> Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <input 
                    placeholder="Client Name"
                    value={formData.client.name}
                    onChange={(e) => setFormData({...formData, client: {...formData.client, name: e.target.value}})}
                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                  />
                  <input 
                    placeholder="Email ID"
                    value={formData.client.email}
                    onChange={(e) => setFormData({...formData, client: {...formData.client, email: e.target.value}})}
                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                  />
                  <input 
                    placeholder="Contact Number"
                    value={formData.client.phone}
                    onChange={(e) => setFormData({...formData, client: {...formData.client, phone: e.target.value}})}
                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500"
                  />
                  <textarea 
                    placeholder="Billing Address"
                    rows="2"
                    value={formData.client.address}
                    onChange={(e) => setFormData({...formData, client: {...formData.client, address: e.target.value}})}
                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500 md:col-span-1"
                  />
                   <textarea 
                    placeholder="Ship To Address"
                    rows="2"
                    value={formData.client.shipToAddress}
                    onChange={(e) => setFormData({...formData, client: {...formData.client, shipToAddress: e.target.value}})}
                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-emerald-500 md:col-span-2"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700 flex items-center gap-2">
                    <div className="w-1 h-4 bg-emerald-600 rounded-full" /> Items & Rates
                  </h3>
                  <button type="button" onClick={handleAddItem} className="text-xs font-black text-emerald-700 hover:underline">
                    + Add Row
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 relative group">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Item Name</label>
                        <select 
                          value={item.itemName}
                          onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                          className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                        >
                          <option value="">Select Item</option>
                          {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Description</label>
                        <input 
                          value={item.itemDescription}
                          onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                          className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                        />
                      </div>
                      <div className="md:col-span-1 space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Qty</label>
                        <input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                          className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none text-center"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Rate</label>
                        <input 
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value))}
                          className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">HSN Code</label>
                        <input 
                          value={item.hsnCode}
                          onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                          className="w-full bg-white border border-slate-100 p-3 rounded-xl font-bold text-sm outline-none"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end justify-center pb-2">
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <LuTrash2 size={20} />
                        </button>
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
                        onClick={() => setFormData({...formData, gstEnabled: !formData.gstEnabled})}
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
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terms and Conditions</label>
                        <textarea 
                          rows="4"
                          value={formData.termsAndConditions}
                          onChange={(e) => setFormData({...formData, termsAndConditions: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note</label>
                        <textarea 
                          rows="2"
                          value={formData.note}
                          onChange={(e) => setFormData({...formData, note: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] flex flex-col justify-between">
                   <div className="space-y-4">
                      <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        <span>Subtotal</span>
                        <span>₹{formData.items.reduce((s,i) => s + (i.quantity*i.rate), 0).toLocaleString()}</span>
                      </div>
                      {formData.gstEnabled && (
                        <div className="flex justify-between text-emerald-400 font-bold uppercase text-[10px] tracking-widest">
                          <span>GST (18%)</span>
                          <span>₹{(formData.items.reduce((s,i) => s + (i.quantity*i.rate), 0) * 0.18).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-white/50">Total Amount</span>
                        <span className="text-4xl font-black text-emerald-400 tracking-tighter">₹{calculateTotal().toLocaleString()}</span>
                      </div>
                   </div>

                   <button 
                    type="submit" 
                    className="mt-10 w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                   >
                     <LuSave size={20} /> Save Proposal
                   </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
