import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/forbidden" replace />;

  return children;
}
