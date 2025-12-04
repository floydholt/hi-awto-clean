import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchListings from "./pages/SearchListings";
import HowItWorks from "./pages/HowItWorks";
import PublicHome from "./pages/PublicHome";

import ForgotPassword from "./pages/ForgotPassword";


import ListingDetails from "./pages/ListingDetails";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import MyListings from "./pages/MyListings";
import Profile from "./pages/Profile";

import MyMessages from "./pages/MyMessages";
import MessagingCenterAdmin from "./pages/MessagingCenterAdmin";
import ViewThread from "./pages/ViewThread";

import AdminDashboard from "./pages/AdminDashboard";
import AdminListings from "./pages/AdminListings";
import AdminUsers from "./pages/AdminUsers";
import AdminFraud from "./pages/AdminFraud";
import AdminLeads from "./pages/AdminLeads";
import AdminHealth from "./pages/AdminHealth";

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
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchListings />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/" element={<PublicHome />} />
          <Route path="/forgot" element={<ForgotPassword />} />





          {/* USER-PROTECTED ROUTES */}
          <Route
            path="/create-listing"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-listing/:id"
            element={
              <ProtectedRoute>
                <EditListing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MyMessages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages/thread/:id"
            element={
              <ProtectedRoute>
                <ViewThread />
              </ProtectedRoute>
            }
          />

          {/* ADMIN-ONLY ROUTES */}
          <Route
            path="/admin"
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
            path="/admin/users"
            element={
              <RequireAdmin>
                <AdminUsers />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/fraud"
            element={
              <RequireAdmin>
                <AdminFraud />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/leads"
            element={
              <RequireAdmin>
                <AdminLeads />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/health"
            element={
              <RequireAdmin>
                <AdminHealth />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/messages"
            element={
              <RequireAdmin>
                <MessagingCenterAdmin />
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
