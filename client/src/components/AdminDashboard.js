import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import ListingForm from "./ListingForm";

export default function AdminDashboard() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "listings"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setListings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await deleteDoc(doc(db, "listings", id));
      fetchListings();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Listings</h2>
      <ListingForm
        listing={selectedListing}
        onSave={fetchListings}
        onCancel={() => setSelectedListing(null)}
      />

      <hr className="my-6" />

      {loading ? (
        <p>Loading listings...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border rounded-xl shadow-md p-4 bg-white hover:shadow-lg transition"
            >
              <img
                src={listing.photos?.[0]}
                alt={listing.address}
                className="h-48 w-full object-cover rounded-md mb-2"
              />
              <h3 className="font-bold">{listing.address}</h3>
              <p>{listing.city}, {listing.state}</p>
              <p>Rent: ${listing.rent?.toLocaleString()}</p>
              <p>Price: ${listing.price?.toLocaleString()}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setSelectedListing(listing)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg"
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
