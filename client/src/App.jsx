// client/src/App.js
import React from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";

import Header from "./components/Header";
import Home from "./components/Home";
import Listings from "./components/Listings";
import ContactForm from "./components/ContactForm";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import useAuth from "./hooks/useAuth";
import AdminProtected from "./components/AdminProtected";

import PublicListings from "./routes/PublicListings";
import ListingDetail from "./routes/ListingDetail";

export default function App() {
  const { user } = useAuth();

  return (
    <div>
      <div className="container mx-auto px-4">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Home />
                <h3 style={{ marginTop: 20 }}>Available Lease Purchase Listings</h3>
                <Listings />
                <h3 style={{ marginTop: 30 }}>Contact / Apply</h3>
                <ContactForm />
              </>
            }
          />

          <Route path="/listings" element={<PublicListings />} />
          <Route path="/listing/:id" element={<ListingDetail />} />

          <Route
            path="/login"
            element={user ? <Navigate to="/admin" /> : <AdminLogin />}
          />

          <Route
            path="/admin/*"
            element={
              <AdminProtected>
                <AdminDashboard />
              </AdminProtected>
            }
          />
        </Routes>
      </div>

      <footer className="footer text-center py-6">
        © {new Date().getFullYear()} Hi-Awto — Lease Purchase Platform
      </footer>
    </div>
  );
}
