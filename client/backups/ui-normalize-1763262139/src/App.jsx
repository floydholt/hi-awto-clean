import React from "react";
import { Routes, Route } from "react-router-dom";

import Homepage from "./pages/Homepage";
import ListingsPage from "./pages/ListingsPage";
import ListingDetail from "./routes/ListingDetail";
import PublicListings from "./routes/PublicListings";

// Admin & Seller
import AdminLogin from "./components/AdminLogin";
import AdminProtected from "./components/AdminProtected";
import DashboardHome from "./components/admin/DashboardHome";
import ListingManager from "./components/admin/ListingManager";
import AdminReviewModeration from "./components/admin/AdminReviewModeration";

import ProtectedRoute from "./components/ProtectedRoute";
import SellerDashboard from "./components/SellerDashboard";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/listings" element={<ListingsPage />} />
      <Route path="/listing/:id" element={<ListingDetail />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminProtected />}>
        <Route path="/admin" element={<DashboardHome />} />
        <Route path="/admin/listings" element={<ListingManager />} />
        <Route path="/admin/reviews" element={<AdminReviewModeration />} />
      </Route>

      {/* Seller */}
      <Route element={<ProtectedRoute />}>
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Homepage />} />
    </Routes>
  );
}

export default App;
