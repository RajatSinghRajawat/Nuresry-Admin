import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const TOKEN_KEY = "nursery_admin_token";
const USER_KEY = "nursery_admin_user";

const AuthContext = createContext(null);

function readStorage(key) {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function readStoredAdmin() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures; auth state still lives in memory.
  }
}

function removeStorage(key) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures.
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStorage(TOKEN_KEY));
  const [admin, setAdmin] = useState(() => readStoredAdmin());

  const login = useCallback((nextToken, nextAdmin) => {
    setToken(nextToken);
    setAdmin(nextAdmin);
    writeStorage(TOKEN_KEY, nextToken);
    writeStorage(USER_KEY, JSON.stringify(nextAdmin));
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setAdmin(null);
    removeStorage(TOKEN_KEY);
    removeStorage(USER_KEY);
  }, []);

  const isSuperAdmin = admin?.role === "superadmin";

  const value = useMemo(
    () => ({
      token,
      admin,
      login,
      logout,
      isAuthenticated: Boolean(token),
      isSuperAdmin,
    }),
    [token, admin, login, logout, isSuperAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
