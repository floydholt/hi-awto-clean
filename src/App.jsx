// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";

import CreateListing from "./pages/CreateListing.jsx";
import MyListings from "./pages/MyListings.jsx";
import ListingDetails from "./pages/ListingDetails.jsx";

import MyMessages from "./pages/MyMessages.jsx";
import ViewThread from "./pages/ViewThread.jsx";
import MessagingCenterAdmin from "./pages/MessagingCenterAdmin.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminListings from "./pages/AdminListings.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";

import SearchListings from "./pages/SearchListings.jsx";
import About from "./pages/About.jsx";

import AdminFraud from "./pages/AdminFraud.jsx";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/search" element={<SearchListings />} />
        <Route path="/how-it-works" element={<About />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Protected */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/fraud" element={<AdminFraud />} />

        <Route
          path="/create-listing"
          element={
            <ProtectedRoute>
              <CreateListing />
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

        {/* Messaging */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MyMessages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/thread/:threadId"
          element={
            <ProtectedRoute>
              <ViewThread />
            </ProtectedRoute>
          }
        />

        {/* Admin Only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute adminOnly>
              <MessagingCenterAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/listings"
          element={
            <ProtectedRoute adminOnly>
              <AdminListings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
