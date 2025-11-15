// client/src/components/ListingManager.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import ListingForm from "./ListingForm";
import useAuth from "../hooks/useAuth";
import { ref, deleteObject } from "firebase/storage";

// Optional UI components (if you created them)
import Button from "./ui/Button";
import Card from "./ui/Card";
import SectionTitle from "./ui/SectionTitle";

// SAFER confirm dialog wrapper
const confirmAction = (msg) => {
  try {
    return window.confirm(msg);
  } catch {
    return false;
  }
};

export default function ListingManager() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "listings"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // sort newest → oldest
      list.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });

      setListings(list);
    } catch (err) {
      console.error("fetchListings error", err);
    } finally {
      setLoading(false);
    }
  };

  // extract storage path from Firebase URL
  const storagePathFromUrl = (url) => {
    try {
      const parts = url.split("/o/");
      if (parts.length < 2) return null;
      const after = parts[1].split("?")[0];
      return decodeURIComponent(after);
    } catch (e) {
      return null;
    }
  };

  // delete all photos for a listing (best-effort)
  const deleteListingPhotos = async (photos = []) => {
    if (!Array.isArray(photos)) return;

    for (const url of photos) {
      try {
        const path = storagePathFromUrl(url);
        if (!path) continue;

        const storageRef = ref(storage, path);
        await deleteObject(storageRef);

        console.log("✔ Deleted storage file:", path);
      } catch (err) {
        console.warn("⚠ Could not delete storage file:", err);
      }
    }
  };

  const handleEdit = (listing) => {
    setEditing(listing);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;

    const ok = confirmAction(
      "Delete listing? This will also attempt to delete stored photos."
    );
    if (!ok) return;

    try {
      await deleteListingPhotos(listing.photos || []);
      await deleteDoc(doc(db, "listings", id));

      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("delete listing err", err);
      alert("Delete failed. Check console.");
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    fetchListings();
  };

  if (!user) {
    return <p className="p-6 text-gray-600">Please sign in to manage listings.</p>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Listing Manager</SectionTitle>

        <Button
          onClick={() => {
            setEditing(null);
            setShowForm((s) => !s);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          variant="brand"
        >
          {showForm ? "Close Form" : "Add Listing"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <ListingForm
            listing={editing}
            onSaved={handleSaved}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </Card>
      )}

      {loading ? (
        <p className="text-gray-500">Loading listings...</p>
      ) : listings.length === 0 ? (
        <p className="text-gray-500">No listings yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <Card key={l.id}>
              <img
                src={l.photos?.[0] || "/placeholder.jpg"}
                alt={l.address || "Listing"}
                className="h-40 w-full object-cover rounded mb-3"
                loading="lazy"
              />

              <h4 className="font-semibold">{l.address}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {l.city}, {l.state}
              </p>

              <div className="mt-3 flex gap-2">
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => handleEdit(l)}
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(l.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
