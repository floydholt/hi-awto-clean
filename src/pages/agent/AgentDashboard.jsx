import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState("moderation");

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Agent Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${activeTab === "moderation" ? "bg-sky-600 text-white" : "bg-slate-200"}`}
          onClick={() => setActiveTab("moderation")}
        >
          Moderation
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "leads" ? "bg-sky-600 text-white" : "bg-slate-200"}`}
          onClick={() => setActiveTab("leads")}
        >
          Leads
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "moderation" && <ModerationModule />}
      {activeTab === "leads" && <LeadsModule />}
    </div>
  );
}

/* -----------------------------
   Moderation Module
----------------------------- */
function ModerationModule() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      const q = query(collection(db, "listings"));
      const snapshot = await getDocs(q);
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchListings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "listings", id), { status: newStatus });
      alert("Listing status updated!");
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Moderate Listings</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Owner</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {listings.map(listing => (
            <tr key={listing.id}>
              <td className="p-2 border">{listing.title}</td>
              <td className="p-2 border">{listing.ownerId}</td>
              <td className="p-2 border">{listing.status}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleStatusChange(listing.id, "published")}
                  className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleStatusChange(listing.id, "draft")}
                  className="bg-yellow-600 text-white px-2 py-1 rounded"
                >
                  Unpublish
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -----------------------------
   Leads Module
----------------------------- */
function LeadsModule() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const q = query(collection(db, "leads"));
      const snapshot = await getDocs(q);
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchLeads();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Leads</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2 border">Buyer</th>
            <th className="p-2 border">Listing</th>
            <th className="p-2 border">Message</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id}>
              <td className="p-2 border">{lead.buyerId}</td>
              <td className="p-2 border">{lead.listingId}</td>
              <td className="p-2 border">{lead.message || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
