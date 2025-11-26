// src/pages/AdminListings.jsx
import React, { useEffect, useState } from "react";
import {
  getAdminListings,
  approveListing,
  rejectListing,
  resetListingToPending,
  setListingFeatured,
} from "../firebase/listings.js";
import { Link } from "react-router-dom";

export default function AdminListings() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending"); // default to pending
  const [fraudFilter, setFraudFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminListings("all");
      setListings(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = listings.filter((l) => {
    if (statusFilter !== "all" && (l.status || "pending") !== statusFilter) {
      return false;
    }

    const s = typeof l.aiFraudScore === "number" ? l.aiFraudScore : null;
    if (fraudFilter === "high" && !(s !== null && s >= 0.8)) return false;
    if (fraudFilter === "medium" && !(s !== null && s >= 0.5 && s < 0.8))
      return false;
    if (fraudFilter === "low" && !(s !== null && s < 0.5)) return false;

    return true;
  });

  const handleAction = async (id, action) => {
    setBusyId(id);
    setError("");
    try {
      if (action === "approve") {
        await approveListing(id);
      } else if (action === "reject") {
        const reason = window.prompt(
          "Optional: enter a rejection reason (shown only in admin tools):",
          ""
        );
        await rejectListing(id, reason || "");
      } else if (action === "reset") {
        await resetListingToPending(id);
      }
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to update listing.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = async (id, current) => {
    setBusyId(id);
    try {
      await setListingFeatured(id, !current);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to update featured state.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Admin: Listings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Moderate listings, review AI fraud flags, and manage featured homes.
          </p>
        </div>
        <Link
          to="/admin"
          className="px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 text-rose-700 text-sm px-3 py-2 border border-rose-100">
          {error}
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-center mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Status:</span>
          {["pending", "approved", "rejected", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full border text-xs ${
                statusFilter === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">AI fraud:</span>
          {[
            { key: "all", label: "All" },
            { key: "high", label: "High" },
            { key: "medium", label: "Medium" },
            { key: "low", label: "Low" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFraudFilter(f.key)}
              className={`px-3 py-1 rounded-full border text-xs ${
                fraudFilter === f.key
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE / LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1.5fr,1.5fr] gap-3 px-4 py-2 text-[11px] font-semibold text-slate-500 border-b border-slate-100">
          <div>Listing</div>
          <div>Price</div>
          <div>Status</div>
          <div>AI fraud / pricing</div>
          <div>Actions</div>
        </div>

        {loading && (
          <div className="px-4 py-4 text-xs text-slate-500">Loading…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="px-4 py-4 text-xs text-slate-500">
            No listings match these filters.
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {filtered.map((l) => {
            const fraudScore =
              typeof l.aiFraudScore === "number" ? l.aiFraudScore : null;
            const fraudPct =
              fraudScore !== null ? Math.round(fraudScore * 100) : null;
            const aiEstimate =
              l.aiPricing?.estimate ??
              l.aiPricing?.price ??
              l.aiPricing?.suggested;

            return (
              <div
                key={l.id}
                className="px-4 py-3 text-xs md:grid md:grid-cols-[2fr,1fr,1fr,1.5fr,1.5fr] md:gap-3"
              >
                {/* Listing info */}
                <div className="mb-2 md:mb-0">
                  <div className="font-medium text-slate-900 text-sm">
                    {l.title || "Untitled listing"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {l.address || "No address"} • ID: {l.id}
                  </div>
                  {l.featured && (
                    <span className="mt-1 inline-flex px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                      Featured
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-2 md:mb-0">
                  <div className="font-semibold text-slate-900">
                    ${l.price?.toLocaleString?.() || l.price}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Down: $
                    {l.downPayment?.toLocaleString?.() || l.downPayment}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-2 md:mb-0 flex flex-col gap-1">
                  <StatusBadge status={l.status} />
                  {typeof l.approved === "boolean" && (
                    <span className="text-[10px] text-slate-500">
                      approved flag: {String(l.approved)}
                    </span>
                  )}
                </div>

                {/* AI info */}
                <div className="mb-2 md:mb-0 flex flex-col gap-1">
                  <FraudBadge score={fraudScore} />
                  {aiEstimate != null && (
                    <span className="text-[11px] text-slate-700">
                      AI est: $
                      {aiEstimate?.toLocaleString?.() || aiEstimate}
                    </span>
                  )}
                  {l.aiPricing?.confidence && (
                    <span className="text-[10px] text-slate-500">
                      Confidence: {l.aiPricing.confidence}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-1 md:justify-end">
                  <button
                    disabled={busyId === l.id}
                    onClick={() => handleAction(l.id, "approve")}
                    className="px-2 py-1 rounded-full bg-emerald-600 text-white text-[11px] hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busyId === l.id}
                    onClick={() => handleAction(l.id, "reject")}
                    className="px-2 py-1 rounded-full bg-rose-600 text-white text-[11px] hover:bg-rose-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    disabled={busyId === l.id}
                    onClick={() => handleAction(l.id, "reset")}
                    className="px-2 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Reset
                  </button>
                  <button
                    disabled={busyId === l.id}
                    onClick={() => toggleFeatured(l.id, l.featured)}
                    className="px-2 py-1 rounded-full border border-indigo-200 text-[11px] text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
                  >
                    {l.featured ? "Unfeature" : "Feature"}
                  </button>
                  <Link
                    to={`/listing/${l.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status || "pending";
  let base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border";

  if (s === "approved") {
    base += " bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (s === "rejected") {
    base += " bg-rose-50 text-rose-700 border-rose-200";
  } else {
    base += " bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <span className={base}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

function FraudBadge({ score }) {
  if (score == null) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-50 text-slate-600 border border-slate-200">
        AI fraud: n/a
      </span>
    );
  }

  const pct = Math.round(score * 100);
  let base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border";
  if (score >= 0.8) {
    base += " bg-red-50 text-red-700 border-red-200";
  } else if (score >= 0.5) {
    base += " bg-amber-50 text-amber-700 border-amber-200";
  } else {
    base += " bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return <span className={base}>AI fraud: {pct}%</span>;
}
