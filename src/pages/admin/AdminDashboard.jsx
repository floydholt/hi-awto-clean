import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="text-slate-600 mt-2">
        View analytics and system logs here.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          to="/admin/analytics"
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
        >
          Analytics
        </Link>
        <Link
          to="/admin/logs"
          className="border border-sky-600 text-sky-600 px-4 py-2 rounded hover:bg-sky-50"
        >
          System Logs
        </Link>
      </div>
    </div>
  );
}
