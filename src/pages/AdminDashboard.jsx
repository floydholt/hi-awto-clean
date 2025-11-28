// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, Suspense } from "react";
import {
  listenToListingCounts,
  listenToUserCounts,
  listenToThreadCounts,
  loadFraudTrendSeries,
  loadAiInsights,
} from "../firebase/adminAnalytics.js";

// Lazy load heavy components
const KpiGrid = React.lazy(() => import("../components/KpiGrid.jsx"));

/* ----------------------------
   FIX: ADD STATCARD HERE
----------------------------- */
function StatCard({ title, data, type }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>

      {type === "chart" && (
        <pre className="text-xs text-slate-500 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      {type === "list" && (
        <p className="text-xs text-slate-600 whitespace-pre-line">
          {data}
        </p>
      )}
    </div>
  );
}

/* ----------------------------
   MAIN COMPONENT
----------------------------- */
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [fraudData, setFraudData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    // Listings listener
    const unsubListings = listenToListingCounts((data) => {
      setMetrics((prev) => [
        { label: "Total Listings", value: data.total },
        { label: "Approved", value: data.approved },
        { label: "Pending", value: data.pending },
        { label: "Rejected", value: data.rejected },
        ...prev.filter(
          (m) =>
            !["Total Listings", "Approved", "Pending", "Rejected"].includes(
              m.label
            )
        ),
      ]);
    });

    // Users listener
    const unsubUsers = listenToUserCounts((data) => {
      setMetrics((prev) => [
        { label: "Total Users", value: data.total },
        { label: "Admins", value: data.admins },
        ...prev.filter((m) => !["Total Users", "Admins"].includes(m.label)),
      ]);
    });

    // Threads listener
    const unsubThreads = listenToThreadCounts((data) => {
      setMetrics((prev) => [
        { label: "Threads", value: data.totalThreads },
        { label: "Active (7d)", value: data.activeLast7d },
        ...prev.filter((m) => !["Threads", "Active (7d)"].includes(m.label)),
      ]);
    });

    // Fraud trend series
    loadFraudTrendSeries().then(setFraudData);

    // AI insights
    loadAiInsights().then(setAiInsights);

    return () => {
      unsubListings();
      unsubUsers();
      unsubThreads();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* KPI Grid */}
      <Suspense fallback={<div>Loading metrics…</div>}>
        <KpiGrid metrics={metrics} />
      </Suspense>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Fraud Trends */}
        <Suspense fallback={<div>Loading fraud trends…</div>}>
          {fraudData && (
            <StatCard title="Fraud Trends" data={fraudData} type="chart" />
          )}
        </Suspense>

        {/* AI Insights */}
        <Suspense fallback={<div>Loading AI insights…</div>}>
          {aiInsights && (
            <StatCard title="AI Insights" data={aiInsights} type="list" />
          )}
        </Suspense>
      </div>
    </div>
  );
}
