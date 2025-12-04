// src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Still loading auth state → don't render anything yet
  if (loading) return null;

  // If user is NOT logged in → redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user IS logged in → allow page to render
  return children;
}
