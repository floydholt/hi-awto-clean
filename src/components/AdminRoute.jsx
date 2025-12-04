// src/components/AdminRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

export default function AdminRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();

  // Wait until auth state is loaded
  if (loading) return null;

  // User not logged in? Send to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // User logged in but NOT an admin? Block them
  if (userRole !== "admin") {
    return <Navigate to="/forbidden" replace />;
  }

  // User is an admin → allow access
  return children;
}
