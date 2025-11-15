import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import useAuth from "./hooks/useAuth";

// Public pages
import Home from "./components/Home";
import ContactForm from "./components/ContactForm";
import PublicListings from "./routes/PublicListings";
import ListingDetail from "./routes/ListingDetail";

// Admin
import AdminLogin from "./components/AdminLogin";
import AdminProtected from "./components/AdminProtected";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./components/admin/DashboardHome";
import ListingManager from "./components/admin/ListingManager";
import AdminReviewModeration from "./components/admin/AdminReviewModeration";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route
            path="/"
            element={
              <>
                <Home />
                <h3 className="text-xl mt-10">Available Lease Purchase Listings</h3>
                <PublicListings previewLimit={6} />
                <h3 className="text-xl mt-10">Contact / Apply</h3>
                <ContactForm />
              </>
            }
          />
          <Route path="/listings" element={<PublicListings />} />
          <Route path="/listing/:id" element={<ListingDetail />} />

          {/* ADMIN LOGIN */}
          <Route
            path="/login"
            element={user ? <Navigate to="/admin" /> : <AdminLogin />}
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin/*"
            element={
              <AdminProtected>
                <DashboardLayout />
              </AdminProtected>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="listings" element={<ListingManager />} />
            <Route path="reviews" element={<AdminReviewModeration />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer className="py-6 text-center text-gray-600">
        © {new Date().getFullYear()} Hi-Awto — Lease Purchase Platform
      </footer>
    </div>
  );
}
