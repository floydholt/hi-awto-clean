import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Link } from "react-router-dom";

export default function DashboardHome() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-4">Welcome to Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/listings"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Listings</h2>
          <p>View, edit, reorder, and upload property listings.</p>
        </Link>

        <Link
          to="/admin/images"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Image Library</h2>
          <p>View and clean up unused uploaded assets.</p>
        </Link>

        <Link
          to="/admin/users"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p>Manage seller accounts, roles, permissions.</p>
        </Link>
      </div>
    </DashboardLayout>
  );
}
