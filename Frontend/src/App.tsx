import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SuppliersPage from "./pages/Suppliers";
import AddSuppliersPage from "./pages/AddSupplierPage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <SuppliersPage />
          </ProtectedRoute>
          }
        />

        <Route
        path="/addSupplier"
        element={
          <ProtectedRoute>
            <AddSuppliersPage />
          </ProtectedRoute>
          }
        />

      <Route path="*" element={<h3>404 - Not Found</h3>} />
    </Routes>
  );
};

export default App;
