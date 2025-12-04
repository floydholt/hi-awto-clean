import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// PUBLIC PAGES
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorks from "./pages/HowItWorks";
import SearchListings from "./pages/SearchListings";
import ForgotPassword from "./pages/ForgotPassword";
import ListingDetails from "./pages/ListingDetails";

// SELLER
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerListings from "./pages/seller/SellerListings";
import SellerBrochures from "./pages/seller/SellerBrochures";

// AGENT
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentLeads from "./pages/agent/AgentLeads";
import AgentModeration from "./pages/agent/AgentModeration";

// ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminListings from "./pages/admin/AdminListings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLogs from "./pages/admin/AdminLogs";

// ROUTE GUARDS
import ProtectedRoute from "./components/ProtectedRoute";
import RequireAdmin from "./components/RequireAdmin";

function App() {
  return (
    <Router>
      <Navbar />

      <div className="min-h-screen pt-20 pb-10">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchListings />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* SELLER ROUTES */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/listings"
            element={
              <ProtectedRoute>
                <SellerListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/brochures"
            element={
              <ProtectedRoute>
                <SellerBrochures />
              </ProtectedRoute>
            }
          />

          {/* AGENT ROUTES */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/leads"
            element={
              <ProtectedRoute>
                <AgentLeads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/moderation"
            element={
              <ProtectedRoute>
                <AgentModeration />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <RequireAdmin>
                <AdminListings />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <RequireAdmin>
                <AdminAnalytics />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <RequireAdmin>
                <AdminLogs />
              </RequireAdmin>
            }
          />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;
