import React, { useEffect, useState } from "react";
import { PhoneCall, Mail, CheckCircle2 } from "lucide-react";
import { getAdminLeadsApi, updateLeadStatusApi } from "../utils/adminApi";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAdminLeadsApi();
      setLeads(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleStatusChange = async (id, status) => {
    await updateLeadStatusApi(id, status);
    setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          Inquiries & Leads
        </span>
        <h1 className="serif-font text-3xl font-bold text-slate-900 mt-0.5">
          Customer Inquiry Tracker
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No active leads received.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4 font-bold">Contact Name</th>
                  <th className="py-3.5 px-4 font-bold">Email & Phone</th>
                  <th className="py-3.5 px-4 font-bold">Subject</th>
                  <th className="py-3.5 px-4 font-bold">Message Details</th>
                  <th className="py-3.5 px-4 font-bold">Lead Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{lead.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-bold">{lead.email}</p>
                      <p className="text-slate-400">{lead.phone || "+91 98765 43210"}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">{lead.subject || "Inquiry"}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{lead.message}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status || "New"}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1"
                      >
                        <option value="New">🟢 New Lead</option>
                        <option value="Contacted">🟡 Contacted</option>
                        <option value="Converted">⭐ Converted</option>
                        <option value="Dismissed">❌ Dismissed</option>
                      </select>
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
