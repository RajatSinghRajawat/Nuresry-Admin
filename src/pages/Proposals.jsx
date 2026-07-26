import React, { useEffect, useState } from "react";
import { FileText, CheckCircle } from "lucide-react";
import { getAdminProposalsApi, updateProposalApi } from "../utils/adminApi";

export default function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAdminProposalsApi();
      setProposals(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleStatusChange = async (id, status) => {
    await updateProposalApi(id, status);
    setProposals(prev => prev.map(p => p._id === id ? { ...p, status } : p));
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          Landscape Projects
        </span>
        <h1 className="serif-font text-3xl font-bold text-slate-900 mt-0.5">
          Custom Proposal Requests
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading proposal requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4 font-bold">Client Name</th>
                  <th className="py-3.5 px-4 font-bold">Project Type</th>
                  <th className="py-3.5 px-4 font-bold">Est. Budget</th>
                  <th className="py-3.5 px-4 font-bold">Requirements</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposals.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <p>{prop.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{prop.phone || prop.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">{prop.projectType}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{prop.estimatedBudget}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{prop.requirements}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={prop.status || "Pending"}
                        onChange={(e) => handleStatusChange(prop._id, e.target.value)}
                        className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1"
                      >
                        <option value="Pending">🟡 Pending Review</option>
                        <option value="Proposal Sent">🔵 Proposal Sent</option>
                        <option value="Approved">🟢 Approved</option>
                        <option value="Rejected">🔴 Rejected</option>
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