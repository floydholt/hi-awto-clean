// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import KpiGrid from "../components/KpiGrid.jsx"; [cite_start]// [cite: 1]
import FraudReportPanel from "../components/FraudReportPanel.jsx"; [cite_start]// [cite: 2]
import AdminAlertsPanel from "../components/AdminAlertsPanel.jsx"; [cite_start]// FIX: Corrected relative path [cite: 5]

// --- Firebase Analytics Helpers ---
import {
  listenToListingCounts,
  listenToUserCounts,
  listenToThreadCounts,
  loadListingsTimeSeries,
  loadAiInsights,
  loadFraudEvents,
  loadListingsForAdmin,
  loadFraudTrends,
} from "../firebase/adminAnalytics.js"; [cite_start]// [cite: 2]

// --- Alert Helpers ---
import {
  listenToAdminAlerts,
  markAdminAlertRead,
} from "../firebase/adminAlerts.js"; [cite_start]// FIX: Corrected path assumption [cite: 5]

// --- Export Helpers ---
import { exportCsv } from "../utils/exportCsv.js"; [cite_start]// [cite: 3]
import { exportXlsx } from "../utils/exportXlsx.js"; [cite_start]// [cite: 3]
import { exportXlsxWithCharts } from "../utils/exportXlsxWithCharts.js"; [cite_start]// [cite: 4]
import { exportFraudPdfReport } from "../utils/exportFraudPdf.js"; [cite_start]// [cite: 4]

import { useAuth } from "../firebase/AuthContext"; [cite_start]// FIX: Corrected path assumption [cite: 4]


// ====================================================================================
// SUBCOMPONENTS (Defined before the main component)
// ====================================================================================

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
                [cite_start]? "bg-blue-600 text-white border-blue-600" // [cite: 11]
                : "bg-white text-slate-600 border-slate-300"
            }`}
          >
            {d}d
          </button>
        ))}

        <button
          onClick={onExport}
          [cite_start]className="px-3 py-1 text-xs rounded-full bg-green-600 text-white hover:bg-green-700" // [cite: 12]
        >
          ⬇ Export CSV
        </button>
      </div>
    </div>
  );
[cite_start]} // [cite: 13]

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
          [cite_start]<p className="text-xs text-slate-400">No fraud data</p> // [cite: 14]
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
                      [cite_start]? "bg-yellow-500" // [cite: 17]
                      : "bg-green-500"
                  }`}
                  style={{ height: `${height}px` }}
                />
                <div className="text-[10px] mt-1 text-slate-500">
                  [cite_start]{new Date(p.timestamp).toLocaleDateString()} // [cite: 18]
                </div>
                <div className="text-[10px] text-slate-400">
                  {p.score}
                </div>
              </div>
            ); [cite_start]// [cite: 19]
          [cite_start]}) // [cite: 20]
        )}
      </div>
    </div>
  );
[cite_start]} // [cite: 21]

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
              [cite_start]to={`/listing/${l.id}`} // [cite: 22]
              className="flex justify-between items-center px-2 py-1 rounded hover:bg-slate-50 text-xs"
            >
              <div>
                <div className="font-medium text-slate-800 truncate">
                  {l.title || [cite_start]"Untitled listing"} // [cite: 23]
                </div>
                <div className="text-slate-500 truncate">
                  {l.address || "No address"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">
                  {l.price ? [cite_start]`$${l.price.toLocaleString()}` : "—"} // [cite: 25]
                </div>
                <div className="text-[10px] uppercase tracking-wide text-slate-400">
                  {l.status || [cite_start]"pending"} // [cite: 26]
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
[cite_start]} // [cite: 27]

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
              [cite_start]<th className="py-2 pr-4">Name</th> {/* [cite: 28] */}
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Joined</th>
            </tr>
          </thead>

          <tbody>
            {userStats?.recentUsers?.length ? (
              [cite_start]userStats.recentUsers.map((u) => ( // [cite: 29]
                <tr key={u.id} className="border-b border-slate-50">
                  <td className="py-2 pr-4">{u.displayName || "—"}</td>
                  <td className="py-2 pr-4 text-slate-600">{u.email || [cite_start]"—"}</td> // [cite: 30]
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        u.role === "admin"
                          ? [cite_start]"bg-emerald-50 text-emerald-700" // [cite: 32]
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {u.role || [cite_start]"user"} // [cite: 33]
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-500">
                    {u.createdAt?.toDate
                      [cite_start]? u.createdAt.toDate().toLocaleDateString() // [cite: 34]
                      : "—"}
                  </td>
                </tr>
              ))
            ) : (
              [cite_start]<tr> {/* [cite: 35] */}
                <td colSpan={4} className="text-center text-slate-400 py-3">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        [cite_start]</table> {/* [cite: 36] */}
      </div>
    </div>
  );
[cite_start]} // [cite: 37]

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
[cite_start]} // [cite: 38]

// -------------------------------------------------------------

export default function AdminDashboard() {
  // FIX 1: Hooks and state must be defined inside the function component
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]); [cite_start]// [cite: 6] (Moved inside)

  const [listingStats, setListingStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [threadStats, setThreadStats] = useState(null); [cite_start]// [cite: 39]

  const [series, setSeries] = useState([]);
  const [fraudSeries, setFraudSeries] = useState([]);
  const [aiInsights, setAiInsights] = useState("");
  const [fraudEvents, setFraudEvents] = useState([]); [cite_start]// [cite: 40]
  const [adminListings, setAdminListings] = useState([]);

  const [range, setRange] = useState(7);
  const [loadingSeries, setLoadingSeries] = useState(false);

  // FIX 2: Handler function moved inside to access 'user'
  [cite_start]const handleMarkAlertRead = async (alertId) => { // [cite: 7]
    if (!user) return;
    try {
      await markAdminAlertRead(alertId, user.uid); [cite_start]// [cite: 7]
    } catch (err) {
      console.error("Failed to mark alert as read", err); [cite_start]// [cite: 8]
    }
  };

  // ─────────────────────────────────────────────
  // REAL-TIME LISTENERS (LISTINGS / USERS / THREADS / ALERTS)
  // ─────────────────────────────────────────────
  [cite_start]useEffect(() => { // [cite: 41]
    const unsub1 = listenToListingCounts(setListingStats);
    const unsub2 = listenToUserCounts(setUserStats);
    const unsub3 = listenToThreadCounts(setThreadStats);
    const unsub4 = listenToAdminAlerts(setAlerts); // FIX: Integrated alert listener

    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
      unsub3 && unsub3();
      unsub4 && unsub4(); // FIX: Added cleanup for alert listener
    };
  }, []);

  // ─────────────────────────────────────────────
  // LOAD TIME-SERIES + FRAUD TREND + AI INSIGHTS
  // ─────────────────────────────────────────────
  [cite_start]useEffect(() => { // [cite: 42]
    setLoadingSeries(true);

    Promise.all([
      loadListingsTimeSeries(range),
      loadFraudTrends(range),
      loadAiInsights(range),
      // Check if functions exist before trying to call them (good practice)
      loadFraudEvents ? loadFraudEvents(range) : Promise.resolve([]),
      loadListingsForAdmin ? loadListingsForAdmin() : Promise.resolve([]),
    ])
      .then(([listingChart, fraudChart, insights, fraudEv, listingsAdmin]) => {
        [cite_start]setSeries(listingChart || []); // [cite: 43]
        setFraudSeries(fraudChart || []);
        setAiInsights(insights || "");
        setFraudEvents(fraudEv || []);
        setAdminListings(listingsAdmin || []);
      })
      .finally(() => setLoadingSeries(false));
  }, [range]); [cite_start]// [cite: 43]

  const maxCount =
    series.length > 0 ? Math.max(...series.map((s) => s.count)) : 1; [cite_start]// [cite: 44]
  const maxFraud =
    fraudSeries.length > 0 ? Math.max(...fraudSeries.map((s) => s.score)) : 1; [cite_start]// [cite: 45]
  const rangeLabel =
    range === 7 ? "Last 7 days" : range === 30 ? "Last 30 days" : "Last 90 days"; [cite_start]// [cite: 47]

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
    exportXlsx(`listings_timeseries_${range}d.xlsx`, rows); [cite_start]// [cite: 48]
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
            [cite_start]values: series.map((x) => x.count), // [cite: 49]
          },
          fraud: {
            labels: fraudSeries.map((x) =>
              new Date(x.timestamp).toLocaleDateString()
            ),
            values: fraudSeries.map((x) => x.score),
          },
          users: {
            [cite_start]labels: (userStats?.recentUsers || []).map((u) => // [cite: 50]
              u.createdAt?.toDate
                ? u.createdAt.toDate().toLocaleDateString()
                : ""
            ),
            values: (userStats?.recentUsers || []).map(() => 1),
          [cite_start]}, // [cite: 51]
        },
      },
      "analytics_report.xlsx"
    );
  }; [cite_start]// [cite: 52]

  const handleExportFraudPdf = () => {
    exportFraudPdfReport(
      {
        fraudEvents,
        listings: adminListings,
        rangeLabel,
      },
      "fraud_report.pdf"
    );
  }; [cite_start]// [cite: 53]

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
          [cite_start]</p> {/* [cite: 54] */}
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
            [cite_start]className="px-3 py-2 text-sm rounded-lg bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200" // [cite: 55]
          >
            Fraud Review
          </Link>

          {/* Export Buttons */}
          <button
            [cite_start]onClick={handleExportXlsxSimple} // [cite: 56]
            className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            📊 Export XLSX
          </button>

          <button
            onClick={handleExportAnalyticsXlsx}
            className="px-3 py-2 text-sm rounded-lg bg-indigo-700 text-white hover:bg-indigo-800"
          > [cite_start]{/* [cite: 57] */}
            📈 XLSX + Charts
          </button>

          <button
            onClick={handleExportFraudPdf}
            className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            🧾 Fraud PDF
          [cite_start]</button> {/* [cite: 58] */}
        </div>
      </div>

      {/* KPI GRID (FIX: Moved the AdminAlertsPanel JSX to its own section) */}
      <KpiGrid
        listingStats={listingStats}
        userStats={userStats}
        threadStats={threadStats}
      />

      {/* ADMIN ALERTS PANEL */}
      [cite_start]<AdminAlertsPanel // [cite: 5]
        alerts={alerts}
        currentUid={user?.uid}
        onMarkRead={handleMarkAlertRead}
      />

      {/* LISTINGS CHART + RECENT LISTINGS */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LISTINGS TREND */}
        [cite_start]<div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6"> {/* [cite: 59] */}
          <DashboardSectionHeader
            title="New Listings Over Time"
            subtitle="Filter by range or export chart data."
            range={range}
            setRange={setRange}
            [cite_start]onExport={() => { // [cite: 60]
              const csvRows = series.map((p) => ({
                label: p.label,
                count: p.count,
                range_days: range,
                exported_at: new Date().toISOString(),
              }));
              exportCsv(`listings_timeseries_${range}d.csv`, csvRows); [cite_start]// [cite: 61]
            }}
          />

          {/* Chart */}
          <div className="h-48 flex items-end gap-2 border-t border-slate-100 pt-4">
            {loadingSeries ? [cite_start]( // [cite: 62]
              <p className="text-xs text-slate-400 animate-pulse">
                Loading chart…
              </p>
            ) : series.length === 0 ? [cite_start]( // [cite: 63]
              <p className="text-xs text-slate-400">No data</p>
            ) : (
              series.map((p, idx) => {
                const height = (p.count / maxCount) * 100 + 10;
                return (
                  [cite_start]<div key={idx} className="flex-1 flex flex-col items-center"> {/* [cite: 64] */}
                    <div
                      className="w-full bg-blue-500 rounded-t-lg transition-all"
                      style={{ height: `${height}px` }}
                    [cite_start]/> {/* [cite: 65] */}
                    <div className="text-[10px] mt-1 text-slate-500">
                      {p.label}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      [cite_start]{p.count} {/* [cite: 66] */}
                    </div>
                  </div>
                );
              })
            )}
          [cite_start]</div> {/* [cite: 67] */}
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

      [cite_start]</div> {/* [cite: 68] */}

      {/* AI INSIGHTS */}
      <AiSummaryPanel insights={aiInsights} />

      {/* FRAUD REPORT PANEL */}
      <FraudReportPanel
        fraudEvents={fraudEvents}
        listings={adminListings}
        rangeLabel={rangeLabel}
        listingSeries={series}
        fraudSeries={fraudSeries}
        userSeries={userStats?.recentUsers || [cite_start][]} // [cite: 69]
      />
    </div>
  );
}
