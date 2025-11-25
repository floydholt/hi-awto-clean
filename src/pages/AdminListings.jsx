// src/pages/AdminListings.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config.js";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending | approved | denied | all
  const [error, setError] = useState("");

  const loadListings = async () => {
    try {
      setLoading(true);

      let q;
      if (filter === "all") {
        q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
      } else {
        q = query(
          collection(db, "listings"),
          where("status", "==", filter),
          orderBy("createdAt", "desc")
        );
      }

      const snap = await getDocs(q);
      setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setError("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [filter]);

  // --- Admin Actions ---
  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "listings", id), { status });
      loadListings();
    } catch (err) {
      alert("Failed to update listing.");
    }
  };

  const toggleFeatured = async (id, current) => {
    try {
      await updateDoc(doc(db, "listings", id), {
        featured: !current,
      });
      loadListings();
    } catch (err) {
      alert("Failed to toggle featured.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Manage Listings
          </h1>
          <p className="text-sm text-slate-500">
            Approve, deny, feature, or remove listings.
          </p>
        </div>

        <Link
          to="/admin"
          className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 mb-5 text-sm">
        {["pending", "approved", "denied", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full border ${
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">
          {error}
        </p>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="py-2 px-3">Home</th>
              <th className="py-2 px-3">Price</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Featured</th>
              <th className="py-2 px-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-b last:border-none">
                <td className="py-3 px-3">
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs text-slate-500">{l.address}</div>
                </td>

                <td className="py-3 px-3">
                  ${l.price?.toLocaleString?.() || l.price}
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      l.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : l.status === "denied"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {l.status || "pending"}
                  </span>
                </td>

                <td className="py-3 px-3">
                  {l.featured ? (
                    <span className="text-yellow-600 text-xs">★ Featured</span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>

                <td className="py-3 px-3 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(l.id, "approved")}
                      className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(l.id, "denied")}
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Deny
                    </button>
                  </div>

                  <button
                    onClick={() => toggleFeatured(l.id, l.featured)}
                    className="px-2 py-1 text-xs rounded border border-slate-300 hover:bg-slate-100"
                  >
                    {l.featured ? "Remove Featured" : "Mark Featured"}
                  </button>

                  <Link
                    to={`/listing/${l.id}`}
                    className="px-2 py-1 text-xs rounded bg-blue-600 text-white text-center hover:bg-blue-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {listings.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-500">
                  No listings found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
