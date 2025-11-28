// src/pages/AdminFraud.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  loadFraudEvents,
  loadListingsForAdmin,
} from "../firebase/adminAnalytics.js";

export default function AdminFraud() {
  const [fraudEvents, setFraudEvents] = useState([]);
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFraudEvents(90), loadListingsForAdmin()])
      .then(([events, listingDocs]) => {
        setFraudEvents(events || []);
        setListings(listingDocs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const listingMap = listings.reduce((acc, l) => {
    acc[l.id] = l;
    return acc;
  }, {});

  const filtered = fraudEvents.filter((e) => {
    if (filter === "all") return true;
    return e.riskLevel === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fraud Review</h1>
          <p className="text-slate-500 text-sm mt-1">
            AI-detected anomalies, suspicious patterns, and risk scores.
          </p>
        </div>

        <Link
          to="/admin"
          className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-800"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-6">
        {["all", "high", "medium", "low"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All Risks" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-slate-600">
              <th className="py-3 px-4">Listing</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Risk</th>
              <th className="py-3 px-4">Flags</th>
              <th className="py-3 px-4">AI Explanation</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-slate-400">
                  No fraud events found.
                </td>
              </tr>
            ) : (
              filtered.map((e, idx) => {
                const l = listingMap[e.listingId] || {};
                return (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    {/* LISTING */}
                    <td className="py-3 px-4">
              <Link
                to={`/listing/${e.listingId}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {l.title || "Unknown listing"}
              </Link>
              <div className="text-xs text-slate-500">{l.address || ""}</div>
            </td>

                    {/* SCORE */}
                    <td className="py-3 px-4 font-bold">{e.score}</td>

                    {/* RISK LEVEL */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${
                            e.riskLevel === "high"
                              ? "bg-red-100 text-red-700"
                              : e.riskLevel === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }
                        `}
                      >
                        {e.riskLevel.toUpperCase()}
                      </span>
                    </td>

                    {/* FLAGS */}
                    <td className="py-3 px-4 text-xs">
                      {(e.flags || []).slice(0, 3).join(", ") || "—"}
                    </td>

                    {/* EXPLANATION */}
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">
                      {e.explanation || "—"}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-xs">
                          Request Docs
                        </button>
                        <button className="px-3 py-1 bg-green-100 rounded hover:bg-green-200 text-xs">
                          Approve
                        </button>
                        <button className="px-3 py-1 bg-red-100 rounded hover:bg-red-200 text-xs">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
