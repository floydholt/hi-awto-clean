// client/src/components/AdminDashboard.jsx
import React from "react";
import ListingManager from "./ListingManager";
import DashboardHome from "./admin/DashboardHome";

export default function AdminDashboard() {
  return (
    <div className="admin-root p-6">
      <div className="admin-grid grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="admin-sidebar md:col-span-1 p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Admin</h3>

          <nav className="flex flex-col gap-2">
            <a className="admin-link" href="/admin">Overview</a>
            <a className="admin-link" href="/admin/listings">Listing Manager</a>
            {/* Add more admin links here (messages, sellers, analytics) */}
          </nav>
        </aside>

        <main className="admin-content md:col-span-3">
          <DashboardHome />
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Listing Manager</h2>
            <ListingManager />
          </div>
        </main>
      </div>
    </div>
  );
}
