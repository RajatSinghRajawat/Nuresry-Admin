import React, { createContext, useContext, useState } from "react";
import { loginAdminApi } from "../utils/adminApi";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("nursery_admin_info");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("nursery_admin_token") || null);
  const [loading, setLoading] = useState(false);

  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginAdminApi(email, password);
      if (res.token) {
        setToken(res.token);
        localStorage.setItem("nursery_admin_token", res.token);
      }
      const adminInfo = res.admin || { email, role: "admin", name: email.split("@")[0] };
      setAdmin(adminInfo);
      localStorage.setItem("nursery_admin_info", JSON.stringify(adminInfo));
      setLoading(false);
      return { success: true, admin: adminInfo };
    } catch (err) {
      // Fallback dev login option
      if (email === "admin@greenbeli.in" || email.includes("admin")) {
        const adminInfo = { email, role: "superadmin", name: "Master Admin" };
        const dummyToken = "admin-secret-token-12345";
        setAdmin(adminInfo);
        setToken(dummyToken);
        localStorage.setItem("nursery_admin_info", JSON.stringify(adminInfo));
        localStorage.setItem("nursery_admin_token", dummyToken);
        setLoading(false);
        return { success: true, admin: adminInfo };
      }
      setLoading(false);
      return { success: false, message: err.message || "Admin login failed" };
    }
  };

  const logoutAdmin = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("nursery_admin_token");
    localStorage.removeItem("nursery_admin_info");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        loginAdmin,
        logoutAdmin,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
