import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "leads"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredLeads = useMemo(() => {
    const s = search.toLowerCase().trim();
    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && !lead.closed) ||
        (statusFilter === "closed" && !!lead.closed);

      const matchesSearch =
        !s ||
        lead.listingId?.toLowerCase().includes(s) ||
        lead.buyerId?.toLowerCase().includes(s) ||
        lead.message?.toLowerCase().includes(s) ||
        lead.email?.toLowerCase().includes(s);

      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const formatDate = (ts) =>
    ts?.toDate
      ? ts.toDate().toLocaleString()
      : ts
      ? new Date(ts).toLocaleString()
      : "—";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads Manager</h1>
          <p className="text-sm text-slate-500">
            Review inbound buyer interest and track responses.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by listingId, buyerId, email, or message..."
          className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          {[
            ["all", "All"],
            ["open", "Open"],
            ["closed", "Closed"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                statusFilter === value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 text-left">Listing</th>
              <th className="px-4 py-2 text-left">Buyer</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Message</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No leads found.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    {lead.listingId || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {lead.buyerId || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {lead.email || "—"}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="line-clamp-2">
                      {lead.message || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {lead.closed ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                        Closed
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Open
                      </span>
                    )}
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
