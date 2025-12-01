import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../firebase/AuthContext";

export default function AdminListings() {
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    let q = query(
      collection(db, "listings"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    if (filter === "pending") {
      q = query(
        collection(db, "listings"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
      );
    } else if (filter === "approved") {
      q = query(
        collection(db, "listings"),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc")
      );
    } else if (filter === "rejected") {
      q = query(
        collection(db, "listings"),
        where("status", "==", "rejected"),
        orderBy("createdAt", "desc")
      );
    } else if (filter === "fraud") {
      q = query(
        collection(db, "listings"),
        where("aiFraud.score", ">=", 75),
        orderBy("aiFraud.score", "desc")
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setListings(data);
      setLoading(false);
    });

    return () => unsub();
  }, [filter]);

  const formatPrice = (value) =>
    value ? `$${Number(value).toLocaleString()}` : "—";

  const handleApprove = async (listingId) => {
    const ref = doc(db, "listings", listingId);
    await updateDoc(ref, {
      status: "approved",
      approvedBy: user?.uid || null,
      approvedAt: new Date(),
    });
  };

  const handleReject = async (listingId) => {
    const ref = doc(db, "listings", listingId);
    await updateDoc(ref, {
      status: "rejected",
      rejectedBy: user?.uid || null,
      rejectedAt: new Date(),
    });
  };

  const handleFlagFraud = async (listingId) => {
    const ref = doc(db, "listings", listingId);
    await updateDoc(ref, {
      status: "fraud",
      fraudFlaggedBy: user?.uid || null,
      fraudFlaggedAt: new Date(),
    });
  };

  // NOTE: wiring Re-run AI to a callable would require a callable function.
  // For now this is a placeholder to avoid runtime errors.
  const handleRerunAI = async (listingId) => {
    console.warn("Re-run AI not yet wired for", listingId);
    alert("Re-run AI is not wired yet. This will call a callable function later.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Listings Moderation
          </h1>
          <p className="text-sm text-slate-500">
            Approve, reject, and review listings. Includes fraud flags and AI
            signals.
          </p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-3 mb-6">
        {[
          ["pending", "Pending"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
          ["fraud", "High Fraud"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              filter === value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* LISTINGS TABLE */}
      <div className="bg-white shadow rounded-xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 text-left">Photo</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Fraud Score</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No listings found.
                </td>
              </tr>
            ) : (
              listings.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelected(l)}
                >
                  <td className="px-4 py-3">
                    {l.imageUrls?.[0] ? (
                      <img
                        src={l.imageUrls[0]}
                        alt=""
                        className="w-16 h-16 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-slate-100" />
                    )}
                  </td>

                  <td className="px-4 py-3">{l.title || "Untitled"}</td>
                  <td className="px-4 py-3">
                    {l.address || "Address not provided"}
                  </td>
                  <td className="px-4 py-3">{formatPrice(l.price)}</td>
                  <td className="px-4 py-3">{l.aiFraud?.score ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{l.status}</td>

                  <td
                    className="px-4 py-3 flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleApprove(l.id)}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(l.id)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleFlagFraud(l.id)}
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                    >
                      Flag Fraud
                    </button>
                    <button
                      onClick={() => handleRerunAI(l.id)}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
                    >
                      Re-run AI
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <ListingDetailSidebar
          listing={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function ListingDetailSidebar({ listing, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Listing Details</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {listing.imageUrls?.[0] && (
          <img
            src={listing.imageUrls[0]}
            className="w-full h-48 rounded object-cover mb-4"
            alt=""
          />
        )}

        <p className="text-xl font-bold text-slate-900">
          {listing.title || "Untitled"}
        </p>
        <p className="text-slate-600">{listing.address}</p>

        <p className="mt-3 text-lg font-semibold">
          {listing.price
            ? `$${Number(listing.price).toLocaleString()}`
            : "—"}
        </p>

        <div className="mt-4">
          <h3 className="font-semibold text-slate-800">Details</h3>
          <p>Beds: {listing.beds ?? "—"}</p>
          <p>Baths: {listing.baths ?? "—"}</p>
          <p>SqFt: {listing.sqft ?? "—"}</p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-slate-800">AI Description</h3>
          <p className="text-sm text-slate-600 whitespace-pre-line">
            {listing.aiFullDescription || "No AI description generated."}
          </p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-slate-800">AI Fraud Score</h3>
          <p
            className={`font-bold ${
              listing.aiFraud?.score >= 75
                ? "text-red-600"
                : listing.aiFraud?.score >= 50
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {listing.aiFraud?.score ?? "—"}
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          <a
            href={`/listing/${listing.id}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            View Public Page →
          </a>
          <a
            href={`/admin?logListing=${listing.id}`}
            className="px-3 py-2 bg-slate-100 text-slate-800 rounded border"
          >
            Open in Activity Feed →
          </a>
        </div>
      </div>
    </div>
  );
}
