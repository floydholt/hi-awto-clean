import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminFraud() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "fraudEvents"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const formatDate = (ts) =>
    ts?.toDate
      ? ts.toDate().toLocaleString()
      : ts
      ? new Date(ts).toLocaleString()
      : "—";

  const riskLabel = (score) => {
    if (score == null) return "Unknown";
    if (score >= 80) return "High";
    if (score >= 50) return "Medium";
    return "Low";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Fraud Control Center
          </h1>
          <p className="text-sm text-slate-500">
            Review AI fraud signals and events across the marketplace.
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 text-left">Listing</th>
              <th className="px-4 py-2 text-left">Score</th>
              <th className="px-4 py-2 text-left">Risk</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Details</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No fraud events recorded.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{e.listingId}</td>
                  <td className="px-4 py-3">{e.score ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        (e.score ?? 0) >= 80
                          ? "bg-red-100 text-red-700"
                          : (e.score ?? 0) >= 50
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {riskLabel(e.score)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(e.createdAt)}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                      {JSON.stringify(e.details || e, null, 2)}
                    </pre>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/admin/listings?listing=${e.listingId}`}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      View Listing →
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
