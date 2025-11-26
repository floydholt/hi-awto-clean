// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  listenToListingCounts,
  listenToUserCounts,
  listenToThreadCounts,
  loadListingsTimeSeries,
} from "../firebase/adminAnalytics.js";

import { loadFraudSeries } from "../firebase/fraudAnalytics.js";

/* -------------------------------------------------------
   AI INSIGHTS (local natural-language generator)
------------------------------------------------------- */
function buildInsightsText({ listingStats, userStats, threadStats, series, range }) {
  if (!listingStats || !userStats || !threadStats || !series.length) {
    return "Not enough data yet. As activity flows in, this panel will summarize trends for you.";
  }

  const totalListings = listingStats.total ?? 0;
  const approved = listingStats.approved ?? 0;
  const pending = listingStats.pending ?? 0;
  const rejected = listingStats.rejected ?? 0;

  const totalUsers = userStats.total ?? 0;
  const admins = userStats.admins ?? 0;

  const totalThreads = threadStats.totalThreads ?? 0;
  const activeLast7d = threadStats.activeLast7d ?? 0;

  const newInRange = series.reduce((sum, p) => sum + (p.count || 0), 0);
  const avgPerDay = range > 0 ? newInRange / range : 0;

  const busiestDay = series.reduce(
    (best, p) => (p.count > best.count ? p : best),
    { label: "", count: 0 }
  );

  return `
Over the last ${range} days, HI-AWTO received ${newInRange} new listings (${avgPerDay.toFixed(
    1
  )}/day avg).

The busiest day was ${busiestDay.label}, with ${busiestDay.count} new listings.

You currently have ${totalListings} total listings: ${approved} approved, ${pending} pending, and ${rejected} rejected.

There are ${totalUsers} users registered, with ${admins} admins.

Messaging activity includes ${totalThreads} conversation threads, ${activeLast7d} of which were active recently.

If pending or rejected listings stay high while new listing volume slows, consider improving fraud rules or listing clarity.
`;
}

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */
export default function AdminDashboard() {
  const [listingStats, setListingStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [threadStats, setThreadStats] = useState(null);

  const [series, setSeries] = useState([]);
  const [range, setRange] = useState(7);
  const [loadingSeries, setLoadingSeries] = useState(false);

  /* FRAUD SERIES */
  const [fraudSeries, setFraudSeries] = useState([]);
  const [fraudRange, setFraudRange] = useState(30);
  const [loadingFraud, setLoadingFraud] = useState(false);

  /* REAL-TIME LISTENERS */
  useEffect(() => {
    const u1 = listenToListingCounts(setListingStats);
    const u2 = listenToUserCounts(setUserStats);
    const u3 = listenToThreadCounts(setThreadStats);
    return () => {
      u1 && u1();
      u2 && u2();
      u3 && u3();
    };
  }, []);

  /* LOAD LISTINGS CHART */
  useEffect(() => {
    setLoadingSeries(true);
    loadListingsTimeSeries(range)
      .then(setSeries)
      .finally(() => setLoadingSeries(false));
  }, [range]);

  /* LOAD FRAUD CHART */
  useEffect(() => {
    setLoadingFraud(true);
    loadFraudSeries(fraudRange)
      .then(setFraudSeries)
      .finally(() => setLoadingFraud(false));
  }, [fraudRange]);

  const maxCount =
    series.length > 0 ? Math.max(...series.map((s) => s.count || 0)) : 1;

  const maxFraud =
    fraudSeries.length > 0 ? Math.max(...fraudSeries.map((p) => p.avg)) : 1;

  const insightsText = buildInsightsText({
    listingStats,
    userStats,
    threadStats,
    series,
    range,
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track platform growth, fraud, and listing activity.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/listings"
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Listings Moderation
          </Link>
          <Link
            to="/admin/fraud"
            className="px-3 py-2 text-sm rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
          >
            Fraud Review
          </Link>
        </div>
      </div>

      {/* INSIGHTS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          AI Insights (auto summary)
        </h2>
        <p className="text-sm whitespace-pre-line text-slate-700">
          {insightsText}
        </p>
      </section>

      {/* KPI GRID */}
      <KpiGrid
        listingStats={listingStats}
        userStats={userStats}
        threadStats={threadStats}
      />

      {/* LISTINGS CHART */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              New Listings Over Time
            </h2>
            <p className="text-xs text-slate-500">
              Choose a time range or export CSV.
            </p>
          </div>

          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  range === d
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-300"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <ListingsChart series={series} loading={loadingSeries} maxCount={maxCount} />
      </section>

      {/* FRAUD TREND CHART */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              AI Fraud Risk Trend
            </h2>
            <p className="text-xs text-slate-500">
              Daily average fraud scores with anomaly detection.
            </p>
          </div>

          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setFraudRange(d)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  fraudRange === d
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-slate-600 border-slate-300"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <FraudChart series={fraudSeries} loading={loadingFraud} maxFraud={maxFraud} />
      </section>
    </div>
  );
}

/* -------------------------------------------------------
   SUBCOMPONENTS
------------------------------------------------------- */

function ListingsChart({ series, loading, maxCount }) {
  if (loading) return <p className="text-xs text-slate-400">Loading…</p>;
  if (!series.length) return <p className="text-xs text-slate-400">No data</p>;

  return (
    <div className="h-48 flex items-end gap-2">
      {series.map((p, idx) => {
        const height = 14 + (p.count / maxCount) * 100;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
              style={{ height }}
            />
            <div className="text-[10px] text-slate-500 mt-1">{p.label}</div>
            <div className="text-[10px] text-slate-400">{p.count}</div>
          </div>
        );
      })}
    </div>
  );
}

function FraudChart({ series, loading, maxFraud }) {
  if (loading) return <p className="text-xs text-slate-400">Loading…</p>;
  if (!series.length) return <p className="text-xs text-slate-400">No data</p>;

  return (
    <div className="h-48 flex items-end gap-2">
      {series.map((p, idx) => {
        const height = 10 + (p.avg / maxFraud) * 100;
        const color = p.anomaly
          ? "from-red-600 to-red-400"
          : "from-blue-600 to-blue-300";

        return (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full bg-gradient-to-t ${color} rounded-t-lg`}
              style={{ height }}
            />
            <div className="text-[10px] text-slate-500 mt-1">{p.label}</div>
            <div
              className={`text-[10px] ${
                p.anomaly ? "text-red-600 font-bold" : "text-slate-400"
              }`}
            >
              {p.avg}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KpiGrid({ listingStats, userStats, threadStats }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <StatCard
        title="Total Listings"
        primary={listingStats?.total ?? "—"}
        sublabel="Approved / Pending / Rejected"
        detail={
          listingStats
            ? `${listingStats.approved} / ${listingStats.pending} / ${listingStats.rejected}`
            : "—"
        }
        accent="bg-blue-50 text-blue-700"
      />

      <StatCard
        title="Registered Users"
        primary={userStats?.total ?? "—"}
        sublabel="Admins"
        detail={userStats?.admins ?? "—"}
        accent="bg-emerald-50 text-emerald-700"
      />

      <StatCard
        title="Message Threads"
        primary={threadStats?.totalThreads ?? "—"}
        sublabel="Active last 7d"
        detail={threadStats?.activeLast7d ?? "—"}
        accent="bg-purple-50 text-purple-700"
      />
    </div>
  );
}

function StatCard({ title, primary, sublabel, detail, accent }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="text-xs uppercase font-semibold text-slate-500">
        {title}
      </div>
      <div className="text-3xl font-bold mt-1">{primary}</div>
      <div className={`inline-block mt-1 px-2 py-1 text-[11px] rounded-full ${accent}`}>
        {sublabel}
      </div>
      <div className="text-xs text-slate-500 mt-2">{detail}</div>
    </div>
  );
}
