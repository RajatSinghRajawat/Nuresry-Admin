import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Sprout, 
  FolderTree, 
  ShoppingBag, 
  Users, 
  PhoneCall, 
  FileText, 
  Receipt, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAdminAuth();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products Catalog", path: "/products", icon: Sprout },
    { name: "Categories", path: "/categories", icon: FolderTree },
    { name: "Orders & Lifecycle", path: "/orders", icon: ShoppingBag },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Inquiry Leads", path: "/leads", icon: PhoneCall },
    { name: "Landscape Proposals", path: "/proposals", icon: FileText },
    { name: "POS Sales & Receipts", path: "/sales", icon: Receipt },
    { name: "Testimonials", path: "/testimonials", icon: MessageSquare },
    { name: "System Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 admin-sidebar-glass text-white flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-800/40 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-emerald-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="serif-font font-bold text-lg text-white leading-tight">GreenBeli</h1>
              <span className="text-[10px] tracking-widest text-emerald-400 uppercase font-semibold block">
                Nursery Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/40 font-bold"
                    : "text-emerald-200/70 hover:bg-emerald-900/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-400"}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-emerald-800/40 bg-emerald-950/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-xs">
              {admin?.name ? admin.name[0].toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden max-w-[110px]">
              <p className="text-xs font-bold text-white truncate">{admin?.name || "Admin"}</p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold uppercase">
                <ShieldCheck className="w-3 h-3" /> {admin?.role || "Manager"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              logoutAdmin();
              navigate("/login");
            }}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
