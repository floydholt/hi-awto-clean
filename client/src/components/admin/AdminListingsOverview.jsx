import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

import ListingForm from "./ListingForm";

export default function AdminListingsOverview() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editListing, setEditListing] = useState(null);

  /** -------------------------------------
   * Fetch all listings
   * ------------------------------------ */
  const fetchListings = async () => {
    setLoading(true);

    try {
      const snap = await getDocs(collection(db, "listings"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      list.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });

      setListings(list);
    } catch (err) {
      console.error("Fetch listings failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  /** -------------------------------------
   * Quick-edit fields (price/rent/status)
   * ------------------------------------ */
  const updateField = async (id, field, value) => {
    try {
      const ref = doc(db, "listings", id);
      await updateDoc(ref, {
        [field]: value,
        updatedAt: serverTimestamp(),
      });

      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, [field]: value }
            : l
        )
      );
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed — see console");
    }
  };

  /** -------------------------------------
   * Analytics
   * ------------------------------------ */
  const total = listings.length;
  const active = listings.filter((l) => !l.archived).length;
  const missingPhotos = listings.filter((l) => !l.photos || l.photos.length === 0).length;

  return (
    <div className="space-y-8">

      {/* --------------------------- */}
      {/* ANALYTICS OVERVIEW */}
      {/* --------------------------- */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm text-gray-500">Total Listings</h3>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm text-gray-500">Active Listings</h3>
          <p className="text-2xl font-bold">{active}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm text-gray-500">Missing Photos</h3>
          <p className="text-2xl font-bold text-red-600">{missingPhotos}</p>
        </div>
      </div>

      {/* --------------------------- */}
      {/* QUICK EDIT TABLE */}
      {/* --------------------------- */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 border-b">
            <tr>
              <th className="py-3 px-3 text-left">Address</th>
              <th className="py-3 px-3 text-left">City</th>
              <th className="py-3 px-3">Price</th>
              <th className="py-3 px-3">Rent</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 text-center" colSpan="6">
                  Loading listings…
                </td>
              </tr>
            ) : listings.length === 0 ? (
              <tr>
                <td className="py-6 text-center" colSpan="6">
                  No listings found.
                </td>
              </tr>
            ) : (
              listings.map((l) => (
                <tr key={l.id} className="border-b last:border-none">
                  <td className="py-3 px-3">{l.address}</td>
                  <td className="py-3 px-3">{l.city}</td>

                  {/* PRICE */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      className="w-24 border rounded px-2 py-1"
                      defaultValue={l.price}
                      onBlur={(e) =>
                        updateField(l.id, "price", Number(e.target.value))
                      }
                    />
                  </td>

                  {/* RENT */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      className="w-24 border rounded px-2 py-1"
                      defaultValue={l.rent}
                      onBlur={(e) =>
                        updateField(l.id, "rent", Number(e.target.value))
                      }
                    />
                  </td>

                  {/* STATUS */}
                  <td className="py-3 px-3 text-center">
                    <button
                      className={`px-3 py-1 rounded text-white ${
                        l.archived ? "bg-gray-500" : "bg-green-600"
                      }`}
                      onClick={() =>
                        updateField(l.id, "archived", !l.archived)
                      }
                    >
                      {l.archived ? "Archived" : "Active"}
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-3 px-3 text-right">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={() => setEditListing(l)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --------------------------- */}
      {/* FULL EDIT MODAL */}
      {/* --------------------------- */}
      {editListing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Listing</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditListing(null)}
              >
                ✕
              </button>
            </div>

            <ListingForm
              listing={editListing}
              onSaved={() => {
                setEditListing(null);
                fetchListings();
              }}
              onCancel={() => setEditListing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
