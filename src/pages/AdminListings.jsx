// src/pages/AdminListings.jsx
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
import { db } from "../firebase/index.js";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-run AI callable
  const handleRerunAI = async (listingId) => {
    try {
      const functions = getFunctions();
      const run = httpsCallable(functions, "reRunAI");
      await run({ listingId });
      alert("AI reprocessing started!");
    } catch (err) {
      console.error(err);
      alert("Failed to run AI. Check console.");
    }
  };

  // Load filtered listings
  useEffect(() => {
    setLoading(true);

    let q = query(
      collection(db, "listings"),
      orderBy("createdAt", "desc"),
      limit(200)
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
      setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [filter]);

  const approve = async (id) => {
    await updateDoc(doc(db, "listings", id), {
      status: "approved",
      reviewedAt: new Date(),
    });
  };

  const reject = async (id) => {
    await updateDoc(doc(db, "listings", id), {
      status: "rejected",
      reviewedAt: new Date(),
    });
  };

  const flagFraud = async (id) => {
    await updateDoc(doc(db, "listings", id), {
      status: "fraud",
      reviewedAt: new Date(),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Listings Moderation</h1>

      {/* FILTERS */}
      <div className="flex gap-3 mb-6">
        {[
          ["pending", "Pending"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
          ["fraud", "High Fraud"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              filter === val
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 text-left">Photo</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Fraud</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
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
                        className="w-16 h-16 rounded object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 rounded" />
                    )}
                  </td>

                  <td className="px-4 py-3">{l.title}</td>
                  <td className="px-4 py-3">{l.address}</td>
                  <td className="px-4 py-3">
                    {l.price
                      ? `$${Number(l.price).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {l.aiFraud?.score ?? "—"}
                  </td>

                  <td
                    className="px-4 py-3 flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => approve(l.id)}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(l.id)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => flagFraud(l.id)}
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                    >
                      Fraud
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
        <ListingSidebar listing={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ListingSidebar({ listing, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Listing Details</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>

        {listing.imageUrls?.[0] && (
          <img
            src={listing.imageUrls[0]}
            alt=""
            className="w-full h-48 object-cover rounded mb-4"
          />
        )}

        <h3 className="text-lg font-semibold">{listing.title}</h3>
        <p className="text-slate-700">{listing.address}</p>

        <p className="text-xl mt-4 font-bold">
          {listing.price
            ? `$${Number(listing.price).toLocaleString()}`
            : "—"}
        </p>

        <div className="mt-6">
          <h4 className="font-semibold">AI Description</h4>
          <p className="text-slate-700 whitespace-pre-line">
            {listing.aiFullDescription || "No AI description."}
          </p>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold">AI Fraud Score</h4>
          <p>{listing.aiFraud?.score ?? "—"}</p>
        </div>

        <div className="mt-6">
          <a
            href={`/listing/${listing.id}`}
            target="_blank"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            rel="noreferrer"
          >
            View Public Page →
          </a>
        </div>
      </div>
    </div>
  );
}
