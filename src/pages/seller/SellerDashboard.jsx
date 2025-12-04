import React from "react";
import { Link } from "react-router-dom";

export default function SellerDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Seller Dashboard</h1>
      <p className="text-slate-600 mt-2">
        Manage your listings and brochures here.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          to="/seller/listings"
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
        >
          View Listings
        </Link>
        <Link
          to="/seller/brochures"
          className="border border-sky-600 text-sky-600 px-4 py-2 rounded hover:bg-sky-50"
        >
          Manage Brochures
        </Link>
      </div>
    </div>
  );
}
