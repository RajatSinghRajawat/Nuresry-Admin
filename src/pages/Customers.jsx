import React, { useEffect, useState, useCallback, useRef } from "react";
import { 
  LuUsers, LuMail, LuCalendar, LuRefreshCw, LuSearch, LuArrowRight, 
  LuPhone, LuMapPin, LuUser, LuX, LuInfo, LuNavigation, LuZap
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://greenbeli.in";

export default function Customers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const pollingRef = useRef(null);

  const fetchCustomers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch customers");
      setCustomers(data);
      setError("");
    } catch (err) {
      if (!isSilent) setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Live Polling Logic
  useEffect(() => {
    if (isLive) {
      pollingRef.current = setInterval(() => {
        fetchCustomers(true);
      }, 10000); // Poll every 10 seconds for "live" feel
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isLive, fetchCustomers]);

  const filtered = customers.filter(c => 
    (c.name || c.firstName)?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const getFullAddress = (addr) => {
    if (!addr) return "Not provided";
    const parts = [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-700">Database</p>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isLive ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
              <LuZap size={10} className={isLive ? 'fill-emerald-700' : ''} />
              {isLive ? 'Live Syncing' : 'Manual Mode'}
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Detailed view of all {customers.length} registered accounts across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[240px]">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              title={isLive ? "Disable Live Polling" : "Enable Live Polling (10s)"}
              className={`p-3 rounded-2xl border transition-all shadow-sm ${isLive ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-200' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600'}`}
            >
              <LuZap size={20} />
            </button>
            <button
              onClick={() => fetchCustomers()}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
            >
              <LuRefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 font-semibold flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-black">!</div>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] animate-pulse space-y-4">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
              <div className="h-4 bg-slate-100 rounded-full w-3/4" />
              <div className="h-3 bg-slate-50 rounded-full w-1/2" />
              <div className="pt-6 border-t border-slate-50 flex justify-between">
                 <div className="h-3 bg-slate-50 rounded-full w-24" />
                 <div className="h-3 bg-slate-50 rounded-full w-8" />
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((user) => (
            <div 
              key={user._id} 
              onClick={() => setSelectedUser(user)}
              className="group bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-[0_32px_64px_-12px_rgba(16,185,129,0.12)] hover:border-emerald-100 transition-all duration-500 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex items-start justify-between mb-8 relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner bg-slate-50">
                  <img 
                    src={user.profilePicture?.[0] || 'https://w7.pngwing.com/pngs/910/606/png-transparent-head-the-dummy-avatar-man-tie-jacket-user-thumbnail.png'} 
                    alt={user.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  ID: {user._id?.slice(-6)}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors capitalize">
                {user.name || user.firstName}
              </h3>
              <div className="space-y-1.5 mb-8">
                <div className="flex items-center gap-2 text-slate-400">
                  <LuMail size={14} className="flex-shrink-0" />
                  <span className="text-xs font-bold truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <LuPhone size={14} className="flex-shrink-0" />
                    <span className="text-xs">{user.phone}</span>
                  </div>
                )}
                {user.address?.city && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <LuMapPin size={14} className="flex-shrink-0" />
                    <span className="text-xs font-medium">{user.address.city}, {user.address.state}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <LuCalendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">
                    Since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-emerald-600 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                  Details <LuArrowRight size={14} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white border border-slate-100 rounded-[3rem]">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
              <LuUsers size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No customers matching your search</h2>
            <p className="text-slate-400 font-medium">Try searching by name, email address, or phone number.</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header / Banner */}
            <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-800 relative">
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors"
              >
                <LuX size={20} />
              </button>
            </div>

            <div className="px-10 pb-10 -mt-12 relative">
              <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                <div className="w-28 h-28 rounded-[2rem] border-4 border-white overflow-hidden shadow-xl bg-white">
                  <img 
                    src={selectedUser.profilePicture?.[0] || 'https://w7.pngwing.com/pngs/910/606/png-transparent-head-the-dummy-avatar-man-tie-jacket-user-thumbnail.png'} 
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 pb-2">
                  <h2 className="text-3xl font-black text-slate-900 capitalize">{selectedUser.name || selectedUser.firstName}</h2>
                  <p className="text-emerald-600 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Verified Customer</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Contact Information</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <LuMail size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Email Address</p>
                          <p className="text-sm font-black text-slate-800">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <LuPhone size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Phone Number</p>
                          <p className="text-sm font-black text-slate-800">{selectedUser.phone || "Not linked"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Personal Info</p>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <LuUser size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Gender & DOB</p>
                          <p className="text-sm font-black text-slate-800">
                            {selectedUser.gender || "Not specified"} {selectedUser.dateOfBirth ? `• ${selectedUser.dateOfBirth}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Shipping Address</p>
                    <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-100 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm mt-0.5">
                        <LuNavigation size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                          {getFullAddress(selectedUser.address)}
                        </p>
                        <button className="mt-3 text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                          View on Map <LuArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Account History</p>
                      <p className="text-xs font-bold text-emerald-600">Member for {Math.floor((new Date() - new Date(selectedUser.createdAt)) / (1000 * 60 * 60 * 24))} days</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                      <LuInfo size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
