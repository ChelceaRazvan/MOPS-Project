import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const role = (user?.role || "").trim().toLowerCase();
  if (!token) return <Navigate to="/login" replace />;
  if (!["admin", "administrator"].includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
