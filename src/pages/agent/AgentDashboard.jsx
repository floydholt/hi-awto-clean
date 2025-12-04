import React from "react";
import { Link } from "react-router-dom";

export default function AgentDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Agent Dashboard</h1>
      <p className="text-slate-600 mt-2">
        Track leads and moderate listings here.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          to="/agent/leads"
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
        >
          View Leads
        </Link>
        <Link
          to="/agent/moderation"
          className="border border-sky-600 text-sky-600 px-4 py-2 rounded hover:bg-sky-50"
        >
          Moderation Tools
        </Link>
      </div>
    </div>
  );
}
