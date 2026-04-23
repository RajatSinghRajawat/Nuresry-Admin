import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  LuLayoutDashboard,
  LuPackage,
  LuLayers,
  LuShoppingBag,
  LuTrendingUp,
  LuQuote,
  LuLogOut,
  LuSettings,
  LuX,
  LuUsers,
  LuMousePointerClick,
  LuFileText,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isSuperAdmin } = useAuth();

  const menu = useMemo(() => {
    const base = [
      { name: "Dashboard", path: "/dashboard", icon: <LuLayoutDashboard />, superOnly: false },
      { name: "Products", path: "/products", icon: <LuPackage />, superOnly: false },
      { name: "Categories", path: "/categories", icon: <LuLayers />, superOnly: false },
      { name: "Orders", path: "/orders", icon: <LuShoppingBag />, superOnly: false },
      { name: "Customers", path: "/customers", icon: <LuUsers />, superOnly: false },
      { name: "Leads", path: "/leads", icon: <LuMousePointerClick />, superOnly: false },
      { name: "Proposals", path: "/proposals", icon: <LuFileText />, superOnly: false },
      { name: "Sales", path: "/sales", icon: <LuTrendingUp />, superOnly: true },
      { name: "Testimonials", path: "/testimonials", icon: <LuQuote />, superOnly: false },
      { name: "Settings", path: "/settings", icon: <LuSettings />, superOnly: true },
    ];
    return base.filter((item) => !item.superOnly || isSuperAdmin);
  }, [isSuperAdmin]);

  const confirmLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] h-screen bg-white text-slate-600 flex flex-col border-r border-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-8 py-4 relative overflow-hidden group">
          <div className="w-full">
            <img
              src={logo}
              alt="Logo"
              className="w-32 md:w-40 lg:w-48 h-auto object-contain"
            />
          </div>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <LuX className="text-xl" />
          </button>
        </div>

        <div className="px-6 mb-4">
          <hr className="border-slate-50" />
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {menu.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={`relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group
                ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                }`}
              >
                <span
                  className={`text-xl z-10 transition-transform duration-300 ${
                    isActive ? "scale-110 text-emerald-600" : "group-hover:scale-110 group-hover:text-emerald-500"
                  }`}
                >
                  {item.icon}
                </span>
                <span className={`font-bold tracking-tight z-10 ${isActive ? "text-emerald-800" : ""}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
          <button
            type="button"
            onClick={confirmLogout}
            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-100 shadow-sm transition-all duration-300 group"
          >
            <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <LuLogOut className="text-xl group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="font-bold text-xs tracking-widest uppercase">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
