import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ListingCard from "../components/ListingCard";

export default function PublicListings() {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: "", minPrice: "", maxPrice: "" });

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setListings(data);
      setFiltered(data);
      setLoading(false);
    };
    fetchListings();
  }, []);

  const handleFilter = () => {
    let results = listings;

    if (filters.city) {
      results = results.filter((l) =>
        l.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.minPrice) {
      results = results.filter((l) => Number(l.price) >= Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      results = results.filter((l) => Number(l.price) <= Number(filters.maxPrice));
    }

    setFiltered(results);
  };

  useEffect(() => {
    handleFilter();
  }, [filters, listings]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Available Lease-to-Own Homes</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by city..."
          className="border p-2 rounded-lg"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <input
          type="number"
          placeholder="Min Price"
          className="border p-2 rounded-lg w-32"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <input
          type="number"
          placeholder="Max Price"
          className="border p-2 rounded-lg w-32"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={handleFilter}
        >
          Filter
        </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <p>Loading listings...</p>
      ) : filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <p>No listings match your criteria.</p>
      )}
    </div>
  );
}
