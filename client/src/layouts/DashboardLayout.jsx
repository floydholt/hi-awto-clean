// client/src/layouts/DashboardLayout.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-card p-5">
        <h2 className="text-xl font-display font-bold mb-6">Hi-Awto Admin</h2>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `p-2 rounded-lg ${isActive ? "bg-brand text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`
            }
          >
            Dashboard Home
          </NavLink>

          <NavLink
            to="/admin/listings"
            className={({ isActive }) =>
              `p-2 rounded-lg ${isActive ? "bg-brand text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`
            }
          >
            Listings Manager
          </NavLink>

          <NavLink
            to="/admin/messages"
            className={({ isActive }) =>
              `p-2 rounded-lg ${isActive ? "bg-brand text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`
            }
          >
            Messages
          </NavLink>

          <NavLink
            to="/admin/reviews"
            className={({ isActive }) =>
              `p-2 rounded-lg ${isActive ? "bg-brand text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`
            }
          >
            Reviews
          </NavLink>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
