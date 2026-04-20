import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginAdmin as apiLogin, getMe } from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [isLoading, setIsLoading] = useState(!!token); // only if we have a stored token

  // On mount, verify stored token
  useEffect(() => {
    if (!token) return;
    getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem("admin_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user } = await apiLogin(email, password);
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
