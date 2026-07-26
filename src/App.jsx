import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";

import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Categories from "./pages/Categories";
import CategoryForm from "./pages/CategoryForm";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Leads from "./pages/Leads";
import Proposals from "./pages/Proposals";
import Sales from "./pages/Sales";
import SalesReceipt from "./pages/SalesReceipt";
import Testimonials from "./pages/Testimonials";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function AdminLayout() {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === "/login") {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f4] flex flex-col font-sans">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/new" element={<CategoryForm />} />
            <Route path="/categories/edit/:id" element={<CategoryForm />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/sales/:id" element={<SalesReceipt />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </AdminAuthProvider>
  );
}
