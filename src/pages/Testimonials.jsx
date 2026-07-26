import React, { useEffect, useState } from "react";
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from "lucide-react";
import { getAdminTestimonialsApi, setTestimonialApprovalApi, deleteTestimonialApi } from "../utils/adminApi";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAdminTestimonialsApi();
      setTestimonials(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleToggleApproval = async (id, currentApproved) => {
    await setTestimonialApprovalApi(id, !currentApproved);
    setTestimonials(prev =>
      prev.map(t => t._id === id ? { ...t, isApproved: !currentApproved } : t)
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      await deleteTestimonialApi(id);
      setTestimonials(prev => prev.filter(t => t._id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          Public Reviews Moderation
        </span>
        <h1 className="serif-font text-3xl font-bold text-slate-900 mt-0.5">
          Customer Testimonials
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading testimonials...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4 font-bold">Author</th>
                  <th className="py-3.5 px-4 font-bold">Rating</th>
                  <th className="py-3.5 px-4 font-bold">Review Comment</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testimonials.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <p>{t.name}</p>
                      <p className="text-[10px] text-emerald-700 font-normal">{t.role} • {t.city}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex text-amber-400">
                        {[...Array(t.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm italic">"{t.comment}"</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {t.isApproved ? "Approved Live" : "Pending Review"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleApproval(t._id, t.isApproved)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            t.isApproved
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "bg-emerald-800 text-white hover:bg-emerald-900"
                          }`}
                        >
                          {t.isApproved ? "Unapprove" : "Approve Live"}
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
