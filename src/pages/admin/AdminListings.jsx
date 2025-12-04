import React from "react";
import DashboardLayout from "../../components/DashboardLayout";

export default function AdminListings() {
  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-slate-900">Admin Listings</h1>
      <p className="text-slate-600 mt-2">
        This is where admins can view and manage all platform listings.
      </p>
    </DashboardLayout>
  );
}
