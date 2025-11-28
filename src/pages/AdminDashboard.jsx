// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import KpiGrid from "../components/KpiGrid.jsx";


// --- Firebase Analytics Helpers ---
import {
  listenToListingCounts,
  listenToUserCounts,
  listenToThreadCounts,
  loadListingsTimeSeries,
  loadAiInsights,
  loadFraudEvents,
  loadListingsForAdmin,
  loadFraudTrends, // ✔ Correct name
} from "../firebase/adminAnalytics.js";

// --- Export Helpers ---
import { exportCsv } from "../utils/exportCsv.js";
import { exportXlsx } from "../utils/exportXlsx.js";
import { exportXlsxWithCharts } from "../utils/exportXlsxWithCharts.js";
import { exportFraudPdfReport } from "../utils/exportFraudPdf.js";

// --- Fraud Report Panel ---
import FraudReportPanel from "../components/FraudReportPanel.jsx";

// --- UI Components ---
import StatCard from "../components/StatCard.jsx"; // ✔ FIX


export default function AdminDashboard() {
  const [listingStats, setListingStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [threadStats, setThreadStats] = useState(null);

  const [series, setSeries] = useState([]);
  const [fraudSeries, setFraudSeries] = useState([]);
  const [aiInsights, setAiInsights] = useState("");

  const [fraudEvents, setFraudEvents] = useState([]);
  const [adminListings, setAdminListings] = useState([]);

  const [range, setRange] = useState(7);
  const [loadingSeries, setLoadingSeries] = useState(false);

  // ─────────────────────────────────────────────
  // REAL-TIME LISTENERS (LISTINGS / USERS / THREADS)
  // ─────────────────────────────────────────────
  useEffect(() => {
    const unsub1 = listenToListingCounts(setListingStats);
    const unsub2 = listenToUserCounts(setUserStats);
    const unsub3 = listenToThreadCounts(setThreadStats);

    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
      unsub3 && unsub3();
    };
  }, []);

  // ─────────────────────────────────────────────
  // LOAD TIME-SERIES + FRAUD TREND + AI INSIGHTS
  // ─────────────────────────────────────────────
  useEffect(() => {
    setLoadingSeries(true);

    Promise.all([
      loadListingsTimeSeries(range),
      loadFraudTrends(range),
      loadAiInsights(range),
      loadFraudEvents ? loadFraudEvents(range) : Promise.resolve([]),
      loadListingsForAdmin ? loadListingsForAdmin() : Promise.resolve([]),
    ])
      .then(([listingChart, fraudChart, insights, fraudEv, listingsAdmin]) => {
        setSeries(listingChart || []);
        setFraudSeries(fraudChart || []);
        setAiInsights(insights || "");
        setFraudEvents(fraudEv || []);
        setAdminListings(listingsAdmin || []);
      })
      .finally(() => setLoadingSeries(false));
  }, [range]);

  const maxCount =
    series.length > 0 ? Math.max(...series.map((s) => s.count)) : 1;

  const maxFraud =
    fraudSeries.length > 0 ? Math.max(...fraudSeries.map((s) => s.score)) : 1;

  const rangeLabel =
    range === 7 ? "Last 7 days" : range === 30 ? "Last 30 days" : "Last 90 days";

  // ─────────────────────────────────────────────
  // EXPORT HANDLERS
  // ─────────────────────────────────────────────
  const handleExportXlsxSimple = () => {
    const rows = series.map((p) => ({
      Date: p.label,
      Count: p.count,
      Range_Days: range,
      Exported_At: new Date().toISOString(),
    }));
    exportXlsx(`listings_timeseries_${range}d.xlsx`, rows);
  };

  const handleExportAnalyticsXlsx = () => {
    exportXlsxWithCharts(
      {
        listings: listingStats?.recentListings || [],
        users: userStats?.recentUsers || [],
        fraud: fraudSeries || [],
        chartSeries: {
          listings: {
            labels: series.map((x) => x.label),
            values: series.map((x) => x.count),
          },
          fraud: {
            labels: fraudSeries.map((x) =>
              new Date(x.timestamp).toLocaleDateString()
            ),
            values: fraudSeries.map((x) => x.score),
          },
          users: {
            labels: (userStats?.recentUsers || []).map((u) =>
              u.createdAt?.toDate
                ? u.createdAt.toDate().toLocaleDateString()
                : ""
            ),
            values: (userStats?.recentUsers || []).map(() => 1),
          },
        },
      },
      "analytics_report.xlsx"
    );
  };

  const handleExportFraudPdf = () => {
    exportFraudPdfReport(
      {
        fraudEvents,
        listings: adminListings,
        rangeLabel,
      },
      "fraud_report.pdf"
    );
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track marketplace activity, growth, fraud risk, and system health.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/listings"
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Listings Moderation
          </Link>

          <Link
            to="/admin/fraud"
            className="px-3 py-2 text-sm rounded-lg bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200"
          >
            Fraud Review
          </Link>

          {/* Export Buttons */}
          <button
            onClick={handleExportXlsxSimple}
            className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            📊 Export XLSX
          </button>

          <button
            onClick={handleExportAnalyticsXlsx}
            className="px-3 py-2 text-sm rounded-lg bg-indigo-700 text-white hover:bg-indigo-800"
          >
            📈 XLSX + Charts
          </button>

          <button
            onClick={handleExportFraudPdf}
            className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            🧾 Fraud PDF
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <KpiGrid
        listingStats={listingStats}
        userStats={userStats}
        threadStats={threadStats}
      />

      {/* LISTINGS CHART + RECENT LISTINGS */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LISTINGS TREND */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <DashboardSectionHeader
            title="New Listings Over Time"
            subtitle="Filter by range or export chart data."
            range={range}
            setRange={setRange}
            onExport={() => {
              const csvRows = series.map((p) => ({
                label: p.label,
                count: p.count,
                range_days: range,
                exported_at: new Date().toISOString(),
              }));
              exportCsv(`listings_timeseries_${range}d.csv`, csvRows);
            }}
          />

          {/* Chart */}
          <div className="h-48 flex items-end gap-2 border-t border-slate-100 pt-4">
            {loadingSeries ? (
              <p className="text-xs text-slate-400 animate-pulse">
                Loading chart…
              </p>
            ) : series.length === 0 ? (
              <p className="text-xs text-slate-400">No data</p>
            ) : (
              series.map((p, idx) => {
                const height = (p.count / maxCount) * 100 + 10;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t-lg transition-all"
                      style={{ height: `${height}px` }}
                    />
                    <div className="text-[10px] mt-1 text-slate-500">
                      {p.label}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {p.count}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RECENT LISTINGS */}
        <RecentListings listingStats={listingStats} />
      </div>

      {/* FRAUD TREND + USERS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* FRAUD TREND */}
        <FraudTrendChart fraudSeries={fraudSeries} maxFraud={maxFraud} />

        {/* USERS */}
        <RecentUsers userStats={userStats} />
      </div>

      {/* AI INSIGHTS */}
      <AiSummaryPanel insights={aiInsights} />

      {/* FRAUD REPORT PANEL */}
      <FraudReportPanel
        fraudEvents={fraudEvents}
        listings={adminListings}
        rangeLabel={rangeLabel}
        listingSeries={series}
        fraudSeries={fraudSeries}
        userSeries={userStats?.recentUsers || []}
      />
    </div>
  );
}

/* ====================================================================================
   SUBCOMPONENTS
==================================================================================== */

function DashboardSectionHeader({ title, subtitle, range, setRange, onExport }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
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

        <button
          onClick={onExport}
          className="px-3 py-1 text-xs rounded-full bg-green-600 text-white hover:bg-green-700"
        >
          ⬇ Export CSV
        </button>
      </div>
    </div>
  );
}

function FraudTrendChart({ fraudSeries, maxFraud }) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-sm font-semibold text-slate-800 mb-1">
        Fraud Risk Trend
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        AI-generated fraud scores over time
      </p>

      <div className="h-48 flex items-end gap-2 border-t border-slate-100 pt-4">
        {fraudSeries.length === 0 ? (
          <p className="text-xs text-slate-400">No fraud data</p>
        ) : (
          fraudSeries.map((p, idx) => {
            const height = (p.score / maxFraud) * 100 + 10;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t-lg ${
                    p.riskLevel === "high"
                      ? "bg-red-500"
                      : p.riskLevel === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ height: `${height}px` }}
                />
                <div className="text-[10px] mt-1 text-slate-500">
                  {new Date(p.timestamp).toLocaleDateString()}
                </div>
                <div className="text-[10px] text-slate-400">
                  {p.score}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RecentListings({ listingStats }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-sm font-semibold text-slate-800 mb-3">
        Recent Listings
      </h2>

      <div className="space-y-2">
        {listingStats?.recentListings?.length ? (
          listingStats.recentListings.map((l) => (
            <Link
              key={l.id}
              to={`/listing/${l.id}`}
              className="flex justify-between items-center px-2 py-1 rounded hover:bg-slate-50 text-xs"
            >
              <div>
                <div className="font-medium text-slate-800 truncate">
                  {l.title || "Untitled listing"}
                </div>
                <div className="text-slate-500 truncate">
                  {l.address || "No address"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">
                  {l.price ? `$${l.price.toLocaleString()}` : "—"}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-slate-400">
                  {l.status || "pending"}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-xs text-slate-400">No recent listings.</p>
        )}
      </div>
    </div>
  );
}

function RecentUsers({ userStats }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-sm font-semibold text-slate-800 mb-3">
        Latest Users
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Joined</th>
            </tr>
          </thead>

          <tbody>
            {userStats?.recentUsers?.length ? (
              userStats.recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-50">
                  <td className="py-2 pr-4">{u.displayName || "—"}</td>
                  <td className="py-2 pr-4 text-slate-600">{u.email || "—"}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        u.role === "admin"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-500">
                    {u.createdAt?.toDate
                      ? u.createdAt.toDate().toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-slate-400 py-3">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AiSummaryPanel({ insights }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-blue-900 mb-2">
        AI Summary Insights
      </h2>
      <p className="text-xs whitespace-pre-line text-blue-800">
        {insights || "No AI summary available."}
      </p>
    </div>
  );
}
