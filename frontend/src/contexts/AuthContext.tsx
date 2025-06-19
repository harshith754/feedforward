import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";

import axios from "@/services/api";

interface User {
  id: number;
  username: string;
  role: "manager" | "employee";
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
  fetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const resp = await axios.get("/api/auth/me");
      setUser(resp.data);
    } catch {
      setUser(null);
    }
  };
  
  const logout = async () => {
    await axios.post("/api/auth/logout");
    setUser(null);
  };
  
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
