import React, { useState } from "react";
import { AuthContext, type User } from "./AuthContext";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem("token"); } catch { return null; }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch { return null; }
  });

  const login = ({ token, user }: { token: string; user: User }) => {
    setToken(token);
    setUser(user);
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    } catch { /* noop */ }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch { /* noop */ }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
