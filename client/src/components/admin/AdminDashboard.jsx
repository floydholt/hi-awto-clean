import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`
            }
          >
            Dashboard Home
          </NavLink>

          <NavLink
            to="/admin/listings"
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`
            }
          >
            Manage Listings
          </NavLink>

          <NavLink
            to="/admin/reviews"
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`
            }
          >
            Review Moderation
          </NavLink>

          <NavLink
            to="/admin/seller-analytics"
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`
            }
          >
            Seller Analytics
          </NavLink>
        </nav>
      </aside>

      {/* MOBILE TOP NAV */}
      <header className="md:hidden w-full bg-white border-b shadow-sm p-4 flex justify-between items-center">
        <h1 className="font-bold text-gray-800">Admin</h1>
        <span className="text-sm text-gray-500">Menu hidden on mobile</span>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
