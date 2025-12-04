import React from "react";
import TopNav from "./TopNav";
import { Link } from "react-router-dom";

export default function DashboardLayout({ role, children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top navigation bar */}
      <TopNav role={role} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-6">
          <h2 className="text-xl font-bold text-sky-600 mb-6">HI-AWTO</h2>
          <nav className="flex flex-col gap-3 text-slate-700">
            {role === "seller" && (
              <>
                <Link to="/seller/dashboard" className="hover:text-sky-600">Dashboard</Link>
                <Link to="/seller/listings" className="hover:text-sky-600">Listings</Link>
                <Link to="/seller/brochures" className="hover:text-sky-600">Brochures</Link>
              </>
            )}
            {role === "agent" && (
              <>
                <Link to="/agent/dashboard" className="hover:text-sky-600">Dashboard</Link>
                <Link to="/agent/leads" className="hover:text-sky-600">Leads</Link>
                <Link to="/agent/moderation" className="hover:text-sky-600">Moderation</Link>
              </>
            )}
            {role === "admin" && (
              <>
                <Link to="/admin/dashboard" className="hover:text-sky-600">Dashboard</Link>
                <Link to="/admin/analytics" className="hover:text-sky-600">Analytics</Link>
                <Link to="/admin/logs" className="hover:text-sky-600">Logs</Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
