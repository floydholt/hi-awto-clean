import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${activeTab === "analytics" ? "bg-sky-600 text-white" : "bg-slate-200"}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "logs" ? "bg-sky-600 text-white" : "bg-slate-200"}`}
          onClick={() => setActiveTab("logs")}
        >
          Logs
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "fraud" ? "bg-sky-600 text-white" : "bg-slate-200"}`}
          onClick={() => setActiveTab("fraud")}
        >
          Fraud Events
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "analytics" && <AnalyticsModule />}
      {activeTab === "logs" && <LogsModule />}
      {activeTab === "fraud" && <FraudModule />}
    </div>
  );
}

/* -----------------------------
   Analytics Module
----------------------------- */
function AnalyticsModule() {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const snapshot = await getDocs(collection(db, "adminMetrics"));
      setMetrics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchMetrics();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
      <ul className="space-y-2">
        {metrics.map(metric => (
          <li key={metric.id} className="border p-2 rounded">
            <strong>{metric.name}</strong>: {metric.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -----------------------------
   Logs Module
----------------------------- */
function LogsModule() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const snapshot = await getDocs(collection(db, "adminLogs"));
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">System Logs</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2 border">Timestamp</th>
            <th className="p-2 border">Event</th>
            <th className="p-2 border">User</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td className="p-2 border">{log.timestamp}</td>
              <td className="p-2 border">{log.event}</td>
              <td className="p-2 border">{log.userId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -----------------------------
   Fraud Events Module
----------------------------- */
function FraudModule() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "fraudEvents"));
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Fraud Detection Events</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2 border">Timestamp</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Details</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.id}>
              <td className="p-2 border">{event.timestamp}</td>
              <td className="p-2 border">{event.type}</td>
              <td className="p-2 border">{event.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
