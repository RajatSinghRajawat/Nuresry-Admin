// components/Sidebar.jsx
import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isSuperAdmin } = useAuth();

  const menu = useMemo(() => {
    const base = [
      { name: "Dashboard", path: "/dashboard", icon: <LuLayoutDashboard />, superOnly: false },
      { name: "Products", path: "/products", icon: <LuPackage />, superOnly: false },
      { name: "Categories", path: "/categories", icon: <LuLayers />, superOnly: false },
      { name: "Orders", path: "/orders", icon: <LuShoppingBag />, superOnly: false },
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
      <motion.div
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="h-screen w-64 bg-white text-slate-600 flex flex-col fixed shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 border-r border-slate-100"
      >
        <div className="flex items-center justify-start px-8 relative overflow-hidden group">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <img
              src={logo}
              alt="Logo"
              className="w-50 h-39 object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>
        </div>

        <div className="px-6 mb-4">
          <hr className="border-slate-50" />
        </div>

        <nav className="flex-1 px-4 space-y-5 overflow-y-auto no-scrollbar">
          {menu.map((item, i) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={item.path}
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
                  <span className={`font-bold tracking-tight z-10 ${isActive ? "text-emerald-800" : ""}`}>{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={confirmLogout}
            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-100 shadow-sm transition-all duration-300 group"
          >
            <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <LuLogOut className="text-xl group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="font-bold text-xs tracking-widest uppercase">Logout</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
