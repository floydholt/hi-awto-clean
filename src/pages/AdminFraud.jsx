// src/pages/AdminFraud.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config.js";

export default function AdminFraud() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("needs_review"); // all | high | medium | low | needs_review
  const [noteDrafts, setNoteDrafts] = useState({}); // { [listingId]: string }

  // Load listings that have AI fraud info
  useEffect(() => {
    let cancelled = false;

    async function loadFraudListings() {
      setLoading(true);
      setError("");

      try {
        const q = query(
          collection(db, "listings"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);

        const rows = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
          };
        });

        // Only keep listings with AI fraud data
        const fraudRows = rows.filter((l) => !!l.aiFraud);

        if (!cancelled) {
          setListings(fraudRows);
        }
      } catch (err) {
        console.error("Error loading fraud listings:", err);
        if (!cancelled) {
          setError("Failed to load fraud data. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFraudListings();
    return () => {
      cancelled = true;
    };
  }, []);

  // Summary counts
  const summary = useMemo(() => {
    let total = listings.length;
    let needs = 0;
    let approved = 0;
    let rejected = 0;

    listings.forEach((l) => {
      const status = l.fraudReviewStatus || "needs_review";
      if (status === "approved") approved++;
      else if (status === "rejected") rejected++;
      else needs++;
    });

    return { total, needs, approved, rejected };
  }, [listings]);

  // Filtered list
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const risk = l.aiFraud?.riskLevel || "low";
      const reviewStatus = l.fraudReviewStatus || "needs_review";

      if (filter === "all") return true;
      if (filter === "needs_review") return reviewStatus === "needs_review";
      if (filter === "high" || filter === "medium" || filter === "low") {
        return risk === filter;
      }
      return true;
    });
  }, [listings, filter]);

  const handleChangeNote = (id, value) => {
    setNoteDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSetStatus = async (listingId, status) => {
    try {
      setSavingId(listingId);
      setError("");

      const note = noteDrafts[listingId] ?? "";

      const ref = doc(db, "listings", listingId);
      await updateDoc(ref, {
        fraudReviewStatus: status,
        fraudReviewNote: note,
        fraudReviewedAt: new Date(),
      });

      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? {
                ...l,
                fraudReviewStatus: status,
                fraudReviewNote: note,
                fraudReviewedAt: new Date(),
              }
            : l
        )
      );
    } catch (err) {
      console.error("Error updating fraud status:", err);
      setError("Failed to update status. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Fraud Review Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review AI-flagged listings and decide whether to approve, reject, or
            request more documentation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin"
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            ← Back to Analytics
          </Link>
          <Link
            to="/admin/listings"
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Listings Moderation
          </Link>
        </div>
      </div>

      {/* SUMMARY STRIP */}
      <div className="grid sm:grid-cols-4 gap-3">
        <SummaryCard
          label="Total flagged listings"
          value={summary.total}
          tone="slate"
        />
        <SummaryCard
          label="Needs review"
          value={summary.needs}
          tone="amber"
        />
        <SummaryCard
          label="Approved"
          value={summary.approved}
          tone="green"
        />
        <SummaryCard
          label="Rejected"
          value={summary.rejected}
          tone="red"
        />
      </div>

      {/* FILTERS + STATUS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <FilterChip
            label="Needs review"
            value="needs_review"
            current={filter}
            onChange={setFilter}
          />
          <FilterChip
            label="High risk"
            value="high"
            current={filter}
            onChange={setFilter}
          />
          <FilterChip
            label="Medium risk"
            value="medium"
            current={filter}
            onChange={setFilter}
          />
          <FilterChip
            label="Low risk"
            value="low"
            current={filter}
            onChange={setFilter}
          />
          <FilterChip
            label="All"
            value="all"
            current={filter}
            onChange={setFilter}
          />
        </div>

        <div className="text-xs text-slate-500">
          {loading
            ? "Loading listings…"
            : `${filteredListings.length} listing(s) shown`}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="px-4 py-2">Listing</th>
                <th className="px-4 py-2">AI Fraud</th>
                <th className="px-4 py-2">Flags</th>
                <th className="px-4 py-2">AI Explanation</th>
                <th className="px-4 py-2">Admin Note</th>
                <th className="px-4 py-2">Decision</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    Loading fraud data…
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    No listings match this filter.
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <FraudRow
                    key={listing.id}
                    listing={listing}
                    saving={savingId === listing.id}
                    noteDraft={noteDrafts[listing.id] ?? listing.fraudReviewNote ?? ""}
                    onChangeNote={handleChangeNote}
                    onSetStatus={handleSetStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Row / Subcomponents
------------------------------------------------------------------- */

function FraudRow({
  listing,
  saving,
  noteDraft,
  onChangeNote,
  onSetStatus,
}) {
  const fraud = listing.aiFraud || {};
  const risk = fraud.riskLevel || "low";
  const score = fraud.score ?? "—";
  const flags = Array.isArray(fraud.flags) ? fraud.flags : [];
  const explanation = fraud.explanation || "";

  const status = listing.fraudReviewStatus || "needs_review";

  const created =
    listing.createdAt?.toDate?.().toLocaleDateString() ||
    listing.createdAt?.toDate?.().toString() ||
    "";

  const thumb =
    Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0
      ? listing.imageUrls[0]
      : "/placeholder-listing.jpg";

  return (
    <tr className="border-b border-slate-100 align-top">
      {/* LISTING INFO */}
      <td className="px-4 py-3">
        <div className="flex gap-3 items-start">
          <div className="h-16 w-20 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
            <img
              src={thumb}
              alt={listing.title || "Listing"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <Link
              to={`/listing/${listing.id}`}
              className="font-semibold text-slate-900 hover:underline text-xs"
            >
              {listing.title || "Untitled listing"}
            </Link>
            <div className="text-[11px] text-slate-500">
              {listing.address || "No address"}
            </div>
            <div className="text-[11px] text-slate-500">
              {listing.price
                ? `$${Number(listing.price).toLocaleString()}`
                : "Price not set"}
            </div>
            <div className="text-[10px] text-slate-400">
              Created: {created || "—"}
            </div>
          </div>
        </div>
      </td>

      {/* AI FRAUD SCORE */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <RiskBadge risk={risk} score={score} />
          <div className="text-[10px] text-slate-400">
            Status:{" "}
            <span className="font-semibold">
              {status === "approved"
                ? "Approved"
                : status === "rejected"
                ? "Rejected"
                : status === "needs_docs"
                ? "Needs docs"
                : "Needs review"}
            </span>
          </div>
        </div>
      </td>

      {/* FLAGS */}
      <td className="px-4 py-3">
        {flags.length === 0 ? (
          <span className="text-[11px] text-slate-400">No flags</span>
        ) : (
          <ul className="space-y-1">
            {flags.slice(0, 5).map((f, idx) => (
              <li
                key={idx}
                className="text-[11px] text-slate-700 flex items-start gap-1"
              >
                <span className="mt-[3px] text-[9px]">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </td>

      {/* EXPLANATION */}
      <td className="px-4 py-3 max-w-xs">
        {explanation ? (
          <p className="text-[11px] text-slate-700 whitespace-pre-line">
            {explanation}
          </p>
        ) : (
          <span className="text-[11px] text-slate-400">
            No AI explanation provided.
          </span>
        )}
      </td>

      {/* ADMIN NOTE */}
      <td className="px-4 py-3">
        <textarea
          rows={3}
          className="w-full text-xs border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Add a short note (what you reviewed, what you need, etc.)"
          value={noteDraft}
          onChange={(e) => onChangeNote(listing.id, e.target.value)}
        />
      </td>

      {/* ACTIONS */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => onSetStatus(listing.id, "approved")}
            className="px-3 py-1.5 rounded-full text-[11px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            ✅ Approve
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSetStatus(listing.id, "needs_docs")}
            className="px-3 py-1.5 rounded-full text-[11px] bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
          >
            📎 Needs Docs
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSetStatus(listing.id, "rejected")}
            className="px-3 py-1.5 rounded-full text-[11px] bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            ❌ Reject
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------
   Small presentational helpers
------------------------------------------------------------------- */

function SummaryCard({ label, value, tone }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  const cls = tones[tone] || tones.slate;

  return (
    <div className={`border rounded-xl px-3 py-2 ${cls}`}>
      <div className="text-[11px] uppercase tracking-wide">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

function FilterChip({ label, value, current, onChange }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`px-3 py-1 rounded-full border text-xs ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function RiskBadge({ risk, score }) {
  let text = "Low risk";
  let cls =
    "bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]";
  if (risk === "medium") {
    text = "Medium risk";
    cls = "bg-amber-50 text-amber-800 border border-amber-200 text-[11px]";
  } else if (risk === "high") {
    text = "High risk";
    cls = "bg-red-50 text-red-700 border border-red-200 text-[11px]";
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${cls}`}>
      <span className="font-semibold">{text}</span>
      <span className="text-[10px] opacity-80">({score})</span>
    </div>
  );
}
