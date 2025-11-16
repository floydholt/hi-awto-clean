// client/src/components/AdminProtected.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function AdminProtected({ children }) {
  const { user } = useAuth();

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Optionally: check role claim here (if you add roles later)
  return <>{children}</>;
}
