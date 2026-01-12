import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute, { AdminRoute } from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminUsersPage from "./pages/AdminList";
import AddContactPage from "./pages/AddContact";
import AddClientPage from "./pages/AddClients";
import SuppliersPage from "./pages/Suppliers";
import AddSuppliersPage from "./pages/AddSupplierPage";
import ItemsPage from "./pages/Items";
import AddItemPage from "./pages/AddItemPage";

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
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsersPage/>
          </AdminRoute>
        }
      />
      <Route path="/add-contact" 
        element={
          <ProtectedRoute>
            <AddContactPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/add-client" 
        element={
          <ProtectedRoute>
            <AddClientPage />
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

        <Route
        path="/items"
        element={
          <ProtectedRoute>
            <ItemsPage />
          </ProtectedRoute>
          }
        />

        <Route
        path="/addItem"
        element={
          <ProtectedRoute>
            <AddItemPage />
          </ProtectedRoute>
          }
        />
      <Route path="*" element={<h3>404 - Not Found</h3>} />
    </Routes>
  );
};
