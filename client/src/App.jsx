import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import MyMessages from "./pages/MyMessages";
import MessagingCenterAdmin from "./pages/MessagingCenterAdmin";
import ViewThread from "./pages/ViewThread";

import AdminLeadCenter from "./components/admin/AdminLeadCenter";
import ListingManager from "./components/admin/ListingManager";
import AdminListingManager from "./components/admin/AdminListingManager";
import "./styles/chat.css";


import { AuthProvider } from "./hooks/useAuth";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Messaging */}
          <Route path="/messages" element={<MyMessages />} />
          <Route path="/messages/thread/:threadId" element={<ViewThread />} />

          {/* Admin Messaging */}
          <Route path="/admin/messages" element={<MessagingCenterAdmin />} />
          <Route path="/admin/messages/thread/:threadId" element={<ViewThread adminMode />} />

          {/* Admin Panels */}
          <Route path="/admin/leads" element={<AdminLeadCenter />} />
          <Route path="/admin/listings" element={<ListingManager />} />
          <Route path="/admin/listings-manager" element={<AdminListingManager />} />

          {/* Fallback */}
          <Route path="*" element={<div style={{ padding: 40 }}>Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
