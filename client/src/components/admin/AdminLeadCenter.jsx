import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminLeadCenter() {
  const [leads, setLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");

  // Modal state
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, leads]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "leads"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setLeads(list);
    } catch (err) {
      console.error("Error loading leads:", err);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    if (filter === "all") return setFiltered(leads);
    setFiltered(leads.filter((l) => l.status === filter));
  };

  const updateStatus = async (lead, status) => {
    try {
      await updateDoc(doc(db, "leads", lead.id), {
        status,
        updatedAt: serverTimestamp(),
      });
      loadLeads();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead permanently?")) return;
    try {
      await deleteDoc(doc(db, "leads", id));
      loadLeads();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lead Center</h2>
          <p className="text-gray-600">View and manage buyer inquiries.</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3">
        {["all", "new", "reviewed", "archived"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded text-sm capitalize ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {f === "all" ? "All Leads" : f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading leads…</p>}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-500 italic">No leads found.</p>
      )}

      {/* Leads Table */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Phone</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{lead.name}</td>
                  <td className="p-3">{lead.email}</td>
                  <td className="p-3">{lead.phone || "—"}</td>
                  <td className="p-3 capitalize">{lead.status || "new"}</td>

                  <td className="p-3 text-center flex justify-center gap-3">
                    <button
                      onClick={() => setSelected(lead)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                    >
                      View
                    </button>

                    {lead.status !== "reviewed" && (
                      <button
                        onClick={() => updateStatus(lead, "reviewed")}
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
                      >
                        Mark Reviewed
                      </button>
                    )}

                    {lead.status !== "archived" && (
                      <button
                        onClick={() => updateStatus(lead, "archived")}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded"
                      >
                        Archive
                      </button>
                    )}

                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* ---------------- MODAL ---------------- */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-xl relative">

            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-4">Lead Details</h3>

            <div className="space-y-2">
              <p><strong>Name:</strong> {selected.name}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Phone:</strong> {selected.phone || "—"}</p>
              <p className="whitespace-pre-wrap">
                <strong>Message:</strong><br />{selected.message || "—"}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Submitted:{" "}
                {selected.createdAt?.toDate
                  ? selected.createdAt.toDate().toLocaleString()
                  : "—"}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
