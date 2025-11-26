// src/pages/AdminListings.jsx
import React, { useState, useEffect } from "react";
import {
  listenToModerationListings,
  approveListing,
  rejectListing,
} from "../firebase/adminListings.js";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const unsub = listenToModerationListings(setListings);
    return () => unsub();
  }, []);

  const filtered = listings.filter((l) => {
    return (l.moderationStatus ?? "pending") === filter;
  });

  const openReject = (listing) => {
    setRejectTarget(listing);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    await rejectListing(rejectTarget.id, rejectReason);
    setRejectTarget(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Listings Moderation</h1>

      {/* FILTER TABS */}
      <div className="flex gap-3 mb-6">
        {["pending", "approved", "rejected"].map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-4 py-2 rounded-full text-sm ${
              filter === option
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* LISTINGS TABLE */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left">
              <th className="p-3">Home</th>
              <th className="p-3">Owner</th>
              <th className="p-3">AI Review</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((listing) => (
              <tr key={listing.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-semibold">{listing.title}</div>
                  <div className="text-xs text-gray-500">
                    {listing.address}
                  </div>
                </td>

                <td className="p-3 text-xs text-gray-600">
                  {listing.ownerId}
                </td>

                {/* AI METADATA */}
                <td className="p-3 text-xs">
                  <div>
                    <span className="font-semibold">Tags:</span>{" "}
                    {listing.aiTags?.slice(0, 3).join(", ") ||
                      "—"}
                  </div>
                  <div>
                    <span className="font-semibold">Fraud:</span>{" "}
                    {listing.fraudScore ?? "—"}
                  </div>
                  <div>
                    <span className="font-semibold">AI Price:</span>{" "}
                    {listing.aiPricing?.estimate
                      ? `$${listing.aiPricing?.estimate.toLocaleString()}`
                      : "—"}
                  </div>
                </td>

                {/* STATUS BADGE */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      listing.moderationStatus === "approved"
                        ? "bg-green-100 text-green-800"
                        : listing.moderationStatus === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {listing.moderationStatus ?? "pending"}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-3 text-right">
                  {filter === "pending" && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => approveListing(listing.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => openReject(listing)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REJECT MODAL */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">
              Reject Listing
            </h2>
            <p className="text-xs text-gray-600 mb-3">
              Provide a reason for rejection:
            </p>

            <textarea
              className="w-full border rounded-lg p-2 text-sm"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejecting this listing…"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 text-sm rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
