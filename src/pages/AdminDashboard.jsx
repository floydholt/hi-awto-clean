// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminListings } from "../firebase/listings.js";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAdminListings("all");
        setListings(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = listings.length;
  const pending = listings.filter((l) => l.status === "pending").length;
  const approved = listings.filter((l) => l.status === "approved").length;
  const rejected = listings.filter((l) => l.status === "rejected").length;

  const highRisk = listings.filter(
    (l) => typeof l.aiFraudScore === "number" && l.aiFraudScore >= 0.8
  );

  const needsReview = listings
    .filter((l) => l.status === "pending" || (l.aiFraudScore || 0) >= 0.6)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review AI insights, approve listings, and monitor fraud risk.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/listings"
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Review Listings
          </Link>
          <Link
            to="/admin/messages"
            className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Admin Inbox
          </Link>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total listings" value={total} />
        <SummaryCard label="Pending review" value={pending} highlight />
        <SummaryCard label="Approved" value={approved} />
        <SummaryCard label="Rejected" value={rejected} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* REVIEW QUEUE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 text-sm">
              Listings needing attention
            </h2>
            <Link
              to="/admin/listings"
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {loading && (
            <p className="text-xs text-slate-500">Loading listings…</p>
          )}

          {!loading && needsReview.length === 0 && (
            <p className="text-xs text-slate-500">
              No urgent items right now. 🎉
            </p>
          )}

          <ul className="mt-2 space-y-2">
            {needsReview.map((l) => (
              <li
                key={l.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {l.title || "Untitled listing"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {l.address || "No address"} • $
                    {l.price?.toLocaleString?.() || l.price}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <StatusPill status={l.status} />
                    <FraudPill score={l.aiFraudScore} />
                  </div>
                </div>
                <Link
                  to={`/admin/listings?id=${l.id}`}
                  className="text-xs text-blue-600 hover:underline shrink-0"
                >
                  Review →
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* FRAUD + AI INSIGHTS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h2 className="font-semibold text-slate-900 text-sm mb-3">
            AI fraud & pricing insights
          </h2>

          <p className="text-xs text-slate-500 mb-3">
            High-risk listings are detected by your Gemini-powered fraud model.
            Use this as a guide, not a final decision.
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="text-xs text-slate-500 mb-1">
                High-risk listings (AI)
              </div>
              <div className="text-xl font-semibold text-red-600">
                {highRisk.length}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500 mb-1">
                Pending manual review
              </div>
              <div className="text-xl font-semibold text-amber-600">
                {pending}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-[11px] text-slate-500 mb-2">
              AI signals available per listing:
            </p>
            <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1">
              <li>AI tags (features, style, neighborhood hints)</li>
              <li>AI caption and full description</li>
              <li>AI pricing range and confidence</li>
              <li>AI fraud risk score & reasoning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight
          ? "border-amber-200 bg-amber-50"
          : "border-slate-100 bg-white"
      }`}
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const s = status || "pending";
  let label = s;
  let classes =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border";

  if (s === "approved") {
    classes += " bg-emerald-50 text-emerald-700 border-emerald-200";
    label = "Approved";
  } else if (s === "rejected") {
    classes += " bg-rose-50 text-rose-700 border-rose-200";
    label = "Rejected";
  } else {
    classes += " bg-amber-50 text-amber-700 border-amber-200";
    label = "Pending";
  }

  return <span className={classes}>{label}</span>;
}

function FraudPill({ score }) {
  if (typeof score !== "number") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-50 text-slate-600 border border-slate-200">
        AI fraud: n/a
      </span>
    );
  }

  const pct = Math.round(score * 100);

  let classes =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border";
  let label = `AI fraud: ${pct}%`;

  if (score >= 0.8) {
    classes += " bg-red-50 text-red-700 border-red-200";
  } else if (score >= 0.5) {
    classes += " bg-amber-50 text-amber-700 border-amber-200";
  } else {
    classes += " bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return <span className={classes}>{label}</span>;
}
