import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "@/services/api";

interface User {
  id: number;
  username: string;
  role: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const resp = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        setUser(resp.data);
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};
