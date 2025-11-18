import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ListingForm from "./ListingForm";
import useAuth from "../../hooks/useAuth";

export default function ListingManager() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "listings"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setListings(items);
    } catch (err) {
      console.error("fetchListings error:", err);
    } finally {
      setLoading(false);
    }
  };

  // FINAL VERSION — uses Cloud Function cleanup only
  const handleDelete = async (id) => {
    if (!window.confirm("Delete listing? This will also delete all photos.")) return;

    try {
      // Delete Firestore document — Cloud Function cleans up storage automatically
      await deleteDoc(doc(db, "listings", id));

      // Update list
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed — see console.");
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    fetchListings();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Listing Manager</h2>
        <button
          className="button"
          onClick={() => {
            setEditing(null);
            setShowForm(!showForm);
            window.scrollTo(0, 0);
          }}
        >
          {showForm ? "Close" : "Add Listing"}
        </button>
      </div>

      {showForm && (
        <ListingForm
          listing={editing}
          onSaved={onSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div>Loading...</div>
      ) : listings.length === 0 ? (
        <div>No listings found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <div className="card" key={l.id}>
              <img
                src={l.photos?.[0] || "/placeholder.jpg"}
                alt=""
                className="w-full h-40 object-cover rounded mb-2"
              />

              <h3 className="font-semibold">{l.address}</h3>
              <p className="text-sm text-gray-600">
                {l.city}, {l.state}
              </p>

              <div className="text-sm text-gray-700 mt-1">
                Rent: ${l.rent?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-700">
                Price: ${l.price?.toLocaleString()}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => handleEdit(l)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(l.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
