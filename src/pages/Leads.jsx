import React, { useEffect, useState, useCallback } from "react";
import { 
  LuMousePointerClick, LuMail, LuPhone, LuCalendar, 
  LuRefreshCw, LuSearch, LuTrash2, LuMessageSquare
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

export default function Leads() {
  const { token, isSuperAdmin } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch leads");
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/leads/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filtered = leads.filter(l => 
    l.name?.toLowerCase().includes(search.toLowerCase()) || 
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Lost': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-700">Inquiries</p>
            {loading && <LuRefreshCw className="animate-spin text-emerald-600" size={14} />}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Sales Leads & Inquiries
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Manage customer requests, bulk orders, and general plant questions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            />
          </div>
          <button onClick={fetchLeads} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-emerald-600 transition-all shadow-sm">
            <LuRefreshCw size={20} />
          </button>
        </div>
      </header>

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 font-semibold flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">!</div>
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Source / Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Info</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Requirement</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((lead) => (
                <tr key={lead._id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter mb-1">{lead.inquiryType}</span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <LuCalendar size={12} />
                        <span className="text-[10px] font-bold uppercase">{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 capitalize">{lead.name}</p>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <LuMail size={12} className="flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <LuPhone size={12} className="flex-shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-[300px]">
                      <p className="text-sm font-bold text-slate-800 truncate mb-1">{lead.subject || "No Subject"}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 italic">"{lead.message}"</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={lead.status}
                      onChange={(e) => updateStatus(lead._id, e.target.value)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border outline-none transition-all cursor-pointer ${getStatusColor(lead.status)}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                        <LuMessageSquare size={18} />
                      </button>
                      {isSuperAdmin && (
                        <button 
                          onClick={() => deleteLead(lead._id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <LuTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <LuMousePointerClick className="mx-auto mb-4 text-slate-200" size={40} />
                    <p className="text-slate-400 font-medium">No inquiries found yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
