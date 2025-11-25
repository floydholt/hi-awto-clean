import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

export default function AdminSellerAnalytics() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadSellerAnalytics();
  }, []);

  const loadSellerAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch sellers (users with role === 'seller')
      const q = query(
        collection(db, "users"),
        where("role", "==", "seller"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      const list = [];

      for (const docSnap of snap.docs) {
        const user = { id: docSnap.id, ...docSnap.data() };

        // Fetch seller leads
        const leadsSnap = await getDocs(
          query(collection(db, "leads"), where("sellerId", "==", user.id))
        );

        // Fetch seller listings
        const listingsSnap = await getDocs(
          query(collection(db, "listings"), where("sellerId", "==", user.id))
        );

        list.push({
          ...user,
          totalListings: listingsSnap.size,
          totalLeads: leadsSnap.size,
        });
      }

      setSellers(list);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Seller Analytics</h2>
        <p className="text-gray-600">
          Performance metrics across all sellers.
        </p>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-600">Loading analytics…</p>}

      {/* Seller Table */}
      {!loading && sellers.length === 0 && (
        <p className="text-gray-600 italic">No sellers found.</p>
      )}

      {!loading && sellers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 font-semibold text-sm text-gray-700">Seller</th>
                <th className="p-3 font-semibold text-sm text-gray-700">Listings</th>
                <th className="p-3 font-semibold text-sm text-gray-700">Leads</th>
                <th className="p-3 font-semibold text-sm text-gray-700">View</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr
                  key={seller.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    <p className="font-medium text-gray-800">{seller.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{seller.email}</p>
                  </td>
                  <td className="p-3">{seller.totalListings}</td>
                  <td className="p-3">{seller.totalLeads}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelected(seller)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-lg rounded-lg shadow-lg p-6 relative">
            {/* Close button */}
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-2">{selected.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{selected.email}</p>

            <div className="space-y-3">
              <div className="flex justify-between bg-gray-100 p-3 rounded">
                <span>Total Listings</span>
                <strong>{selected.totalListings}</strong>
              </div>

              <div className="flex justify-between bg-gray-100 p-3 rounded">
                <span>Total Leads</span>
                <strong>{selected.totalLeads}</strong>
              </div>

              <div className="flex justify-between bg-gray-100 p-3 rounded">
                <span>Joined</span>
                <strong>
                  {selected.createdAt?.toDate
                    ? selected.createdAt.toDate().toLocaleDateString()
                    : "Unavailable"}
                </strong>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-300 rounded"
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
