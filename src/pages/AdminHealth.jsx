import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminHealth() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "adminLogs"),
      orderBy("timestamp", "desc"),
      limit(200)
    );

    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const stats = useMemo(() => {
    const last24h = logs.filter(
      (l) => typeof l.timestamp === "number" && l.timestamp >= oneDayAgo
    );

    const errors24h = last24h.filter(
      (l) => l.severity === "error" || l.severity === "critical"
    ).length;

    const fraudFlags24h = last24h.filter(
      (l) => l.type?.includes("FRAUD")
    ).length;

    const aiJobs24h = last24h.filter((l) =>
      ["LISTING_PROCESSING_STARTED", "LISTING_PROCESSED"].includes(l.type)
    ).length;

    return {
      totalLogs: logs.length,
      errors24h,
      fraudFlags24h,
      aiJobs24h,
    };
  }, [logs, oneDayAgo]);

  const formatTime = (ts) =>
    ts
      ? new Date(ts).toLocaleString()
      : "—";

  const errorLogs = logs.filter(
    (l) => l.severity === "error" || l.severity === "critical"
  );

  const aiLogs = logs.filter((l) =>
    ["LISTING_PROCESSING_STARTED", "LISTING_PROCESSED"].includes(l.type)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            System Health & AI Pipeline
          </h1>
          <p className="text-sm text-slate-500">
            Monitor recent errors, fraud flags, and AI processing jobs.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthCard
          title="Errors (24h)"
          value={stats.errors24h}
          tone={stats.errors24h > 0 ? "bad" : "good"}
        />
        <HealthCard
          title="Fraud Flags (24h)"
          value={stats.fraudFlags24h}
          tone={stats.fraudFlags24h > 0 ? "warn" : "good"}
        />
        <HealthCard
          title="AI Jobs (24h)"
          value={stats.aiJobs24h}
          tone="neutral"
        />
        <HealthCard
          title="Total Logs Loaded"
          value={stats.totalLogs}
          tone="neutral"
        />
      </div>

      {/* Error log table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">
          Recent Errors & Critical Events
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : errorLogs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No errors recorded in the last 200 events.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {errorLogs.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{formatTime(l.timestamp)}</td>
                    <td className="py-2 pr-3">{l.type}</td>
                    <td className="py-2 pr-3">
                      <div className="max-w-xl whitespace-pre-wrap">
                        {l.message}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI jobs table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">
          AI Processing Jobs (Recent)
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : aiLogs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No AI processing jobs recorded.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {aiLogs.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{formatTime(l.timestamp)}</td>
                    <td className="py-2 pr-3">{l.type}</td>
                    <td className="py-2 pr-3">
                      <div className="max-w-xl whitespace-pre-wrap">
                        {l.message}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function HealthCard({ title, value, tone }) {
  const base =
    "rounded-xl p-4 border shadow-sm flex flex-col justify-between min-h-[90px]";
  const styles =
    tone === "bad"
      ? "bg-red-50 border-red-100 text-red-900"
      : tone === "warn"
      ? "bg-amber-50 border-amber-100 text-amber-900"
      : tone === "good"
      ? "bg-emerald-50 border-emerald-100 text-emerald-900"
      : "bg-slate-50 border-slate-100 text-slate-900";

  return (
    <div className={`${base} ${styles}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-80">
        {title}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
