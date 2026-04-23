import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
  HiOutlineChevronDown,
  HiOutlineCog6Tooth,
  HiOutlineUser,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBars3BottomLeft,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { admin, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const initial = admin?.name?.trim()?.charAt(0)?.toUpperCase() || "A";
  const roleLabel = isSuperAdmin ? "Super Admin" : "Admin";

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="fixed top-0 left-0 lg:left-64 right-0 h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-10 z-40 border-b border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-emerald-600 border border-slate-100 transition-colors"
        >
          <HiOutlineBars3BottomLeft size={24} />
        </button>

        <div
          className={`flex items-center rounded-2xl px-3 md:px-5 py-2 gap-2 md:gap-3 transition-all duration-500 border
            ${
              isSearchFocused
                ? "bg-white shadow-xl shadow-slate-200/40 border-emerald-200 w-[200px] sm:w-[420px]"
                : "bg-slate-50/50 border-slate-100 w-[140px] sm:w-[340px]"
            }`}
        >
          <HiOutlineMagnifyingGlass
            className={`text-lg md:text-xl transition-colors duration-300 ${isSearchFocused ? "text-emerald-600" : "text-slate-400"}`}
          />
          <input
            type="text"
            placeholder={window.innerWidth < 640 ? "Search..." : "Search dashboard..."}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="bg-transparent outline-none text-xs md:text-sm w-full text-slate-700 font-medium placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button
          type="button"
          className="relative p-2 md:p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 transition-colors group"
        >
          <HiOutlineBell className="text-xl md:text-2xl" />
          <span className="absolute top-2 right-2 md:top-2.5 md:right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-4 bg-white p-1.5 pr-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-lg font-black shadow-inner">
              {initial}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-black text-slate-800 leading-none">{admin?.name || "Admin"}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-1">{roleLabel}</p>
            </div>
            <HiOutlineChevronDown
              className={`text-slate-300 text-[10px] transition-transform duration-500 ${isProfileOpen ? "rotate-180" : ""}`}
            />
          </button>

            {isProfileOpen && (
              <div
                className="absolute right-0 mt-3 w-60 bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-2 z-50 overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors group text-left"
                >
                  <span className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <HiOutlineUser />
                  </span>
                  My Profile
                </button>

                {isSuperAdmin && (
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors group text-left"
                  >
                    <span className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <HiOutlineCog6Tooth />
                    </span>
                    Settings
                  </Link>
                )}

                <hr className="my-2 border-slate-50" />

                <button
                  type="button"
                  onClick={signOut}
                  className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors group text-left"
                >
                  <span className="p-2 bg-red-50 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <HiOutlineArrowLeftOnRectangle />
                  </span>
                  Sign Out
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
