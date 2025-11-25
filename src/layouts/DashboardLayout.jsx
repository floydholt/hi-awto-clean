// client/src/layouts/DashboardLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";
import { FiHome, FiSettings, FiList } from "react-icons/fi";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* sidebar */}
      <aside className="w-64 bg-white shadow-lg p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>

        <nav className="space-y-2">
          <Link
            to="/admin"
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
          >
            <FiHome /> Home
          </Link>

          <Link
            to="/admin/listings"
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
          >
            <FiList /> Listings
          </Link>

          <Link
            to="/admin/settings"
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
          >
            <FiSettings /> Settings
          </Link>
        </nav>
      </aside>

      {/* main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
