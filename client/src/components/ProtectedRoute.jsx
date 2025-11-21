import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext.jsx";

export default function ProtectedRoute({ children, adminOnly }) {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="p-4">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}
