import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { ref, deleteObject, listAll } from "firebase/storage";
import ListingForm from "./ListingForm";

export default function AdminListingManager() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // -------------------------------
  // LOAD LISTINGS
  // -------------------------------
  useEffect(() => {
    async function loadListings() {
      setLoading(true);

      const listingsRef = collection(db, "listings");
      let q = listingsRef;

      // Try ordering by createdAt if the index exists
      try {
        q = query(listingsRef, orderBy("createdAt", "desc"));
      } catch (err) {
        console.warn("Skipping createdAt order:", err.message);
      }

      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({
        id: d.id,
        title: d.data().title || "(Untitled Listing)",
        address: d.data().address || "",
        ...d.data(),
      }));

      setListings(data);
      setLoading(false);
    }

    loadListings();
  }, []);

  // -------------------------------
  // DELETE LISTING + IMAGES
  // -------------------------------
  async function deleteListing(listingId) {
    if (!window.confirm("Delete this listing?")) return;

    const folderRef = ref(storage, `listings/${listingId}`);

    try {
      const list = await listAll(folderRef);
      const deleteOps = list.items.map((item) => deleteObject(item));
      await Promise.all(deleteOps);

      await deleteDoc(doc(db, "listings", listingId));

      setListings((prev) => prev.filter((l) => l.id !== listingId));
      alert("Listing deleted.");
    } catch (err) {
      console.error(err);
      alert("Error deleting listing.");
    }
  }

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div className="admin-listing-manager">
      <div className="header">
        <h2>Listing Manager</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          + Add New Listing
        </button>
      </div>

      {showForm && (
        <ListingForm
          editing={editing}
          close={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <p>Loading listings...</p>
      ) : (
        <div>
          {listings.map((listing) => (
            <div key={listing.id} className="listing-item">
              <h3>{listing.title}</h3>
              <p>{listing.address}</p>

              <button
                onClick={() => {
                  setEditing(listing);
                  setShowForm(true);
                }}
              >
                Edit
              </button>

              <button onClick={() => deleteListing(listing.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
