// client/src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Home from "./components/Home";
import Listings from "./components/Listings";
import ContactForm from "./components/ContactForm";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import useAuth from "./hooks/useAuth";

// new routes
import PublicListings from "./routes/PublicListings";
import ListingDetail from "./routes/ListingDetail"; // ✅ corrected path


export default function App() {
  const { user } = useAuth();

  return (
    <div>
      <div className="container">
        <Header />
        <Routes>
          {/* Home page */}
          <Route
            path="/"
            element={
              <>
                <Home />
                <h3 style={{ marginTop: 20 }}>
                  Available Lease Purchase Listings
                </h3>
                <Listings />
                <h3 style={{ marginTop: 30 }}>Contact / Apply</h3>
                <ContactForm />
              </>
            }
          />

          {/* Public listings and detail pages */}
          <Route path="/listings" element={<PublicListings />} />
          <Route path="/listing/:id" element={<ListingDetail />} />

          {/* Admin login and dashboard */}
          <Route
            path="/login"
            element={user ? <Navigate to="/admin" /> : <AdminLogin />}
          />
          <Route
            path="/admin"
            element={user ? <AdminDashboard /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} Hi-Awto — Lease Purchase Platform
      </footer>
    </div>
  );
}
