import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import PublicListings from "./routes/PublicListings";
import ListingDetail from "./routes/ListingDetail";
import ContactForm from "./components/ContactForm";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import useAuth from "./hooks/useAuth";
import InboxPanel from "./components/InboxPanel";
import MessagingCenterAdmin from "./pages/MessagingCenterAdmin.jsx";
import MyMessages from "./pages/MyMessages";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="container py-8">Loading...</div>;

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <div className="container py-6">
          <Header />

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Home />
                  <h3 className="mt-6 text-lg font-semibold">
                    Available Lease Purchase Listings
                  </h3>
                  <PublicListings />
                  <h3 className="mt-8 text-lg font-semibold">Contact / Apply</h3>
                  <ContactForm />
                </>
              }
            />
            <Route path="/messages" element={<MyMessages />} />
            <Route path="/admin/messages" element={<MessagingCenterAdmin />} />
            <Route path="/listings" element={<PublicListings />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/messages" element={<InboxPanel />} />
            <Route path="/admin/messages" element={<MessagingCenterAdmin />} /> 
            <Route
              path="/login"
              element={user ? <Navigate to="/admin" /> : <AdminLogin />}
            />

            <Route
              path="/admin/*"
              element={user ? <AdminDashboard /> : <Navigate to="/login" />}
            />

            <Route
              path="*"
              element={<div className="p-8 text-gray-500">Not found</div>}
            />
          </Routes>
        </div>

        <footer className="bg-white border-t py-4 mt-auto text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Hi-Awto — Lease Purchase Platform
        </footer>
      </div>
    </BrowserRouter>
  );
}
