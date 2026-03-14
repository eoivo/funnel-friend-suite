import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, mockUsers } from "@/mock/mockUsers";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string) => {
    const found = mockUsers.find((u) => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    // Allow any email for demo
    setUser({ id: "user-demo", name: email.split("@")[0], email, avatar: email[0].toUpperCase() + (email[1]?.toUpperCase() || ""), role: "admin" });
    return true;
  };

  const register = (name: string, email: string, _password: string) => {
    setUser({ id: "user-new", name, email, avatar: name.slice(0, 2).toUpperCase(), role: "admin" });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
