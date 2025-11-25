import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ListingManager from "./ListingManager";
import AdminReviewModeration from "./AdminReviewModeration";
import AdminSellerAnalytics from "./AdminSellerAnalytics";
import AdminLeadCenter from "./AdminLeadCenter";
import AdminLogs from "./AdminLogs";




export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <aside className="lg:col-span-1 card">
        <h3 className="text-lg font-semibold mb-4">Admin</h3>
        <nav className="space-y-2">
          <Link to="/admin/listings" className="block text-blue-600">
            Listings
          </Link>
          <Link to="/admin/leads" className="block text-blue-600">
            Leads
          </Link>
          <Link to="/admin/reviews" className="block text-blue-600">
            Reviews
          </Link>
          <Link to="/admin/analytics" className="block text-blue-600">
            Analytics
          </Link>
          <Link to="/admin/logs" className="block text-blue-600">
            Logs
          </Link>
        </nav>
      </aside>

      <main className="lg:col-span-5 space-y-6">
        <Routes>
          <Route index element={<div>Welcome to Admin Dashboard</div>} />
          <Route path="listings" element={<ListingManager />} />
          <Route path="reviews" element={<AdminReviewModeration />} />
          <Route path="analytics" element={<AdminSellerAnalytics />} />
          <Route path="leads" element={<AdminLeadCenter />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Routes>
      </main>
    </div>
  );
}
