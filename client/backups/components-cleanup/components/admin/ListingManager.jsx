import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ListingForm from "./ListingForm";
import useAuth from "../../hooks/useAuth";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function ListingManager() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) loadListings();
  }, [user]);

  const loadListings = async () => {
    const snap = await getDocs(collection(db, "listings"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setListings(list);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Listing Manager</h1>

      <button
        onClick={() => { setShowForm(!showForm); setEditing(null); }}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {showForm ? "Close Form" : "Add Listing"}
      </button>

      {showForm && (
        <ListingForm
          listing={editing}
          onSaved={() => { setShowForm(false); loadListings(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {listings.map((l) => (
          <div key={l.id} className="bg-white rounded shadow p-3">
            <img
              src={l.photos?.[0] || "/placeholder.jpg"}
              className="h-40 w-full object-cover rounded"
            />
            <h2 className="mt-2 font-semibold">{l.address}</h2>
            <button
              onClick={() => { setEditing(l); setShowForm(true); }}
              className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
