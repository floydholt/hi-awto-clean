// src/pages/SearchListings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
} from "firebase/firestore";
import { db } from "../firebase";

const SearchListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        setError("");

        const q = query(
          collection(db, "listings"),
          orderBy("createdAt", "desc"),
          limit(50)
        );

        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setListings(items);
      } catch (err) {
        console.error("Error loading listings:", err);
        setError("There was a problem loading listings.");
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      result = result.filter((item) => {
        const fields = [
          item.title,
          item.address,
          item.city,
          item.state,
          item.zip,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fields.includes(k);
      });
    }

    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    if (min !== null) {
      result = result.filter(
        (item) => item.price && Number(item.price) >= min
      );
    }
    if (max !== null) {
      result = result.filter(
        (item) => item.price && Number(item.price) <= max
      );
    }

    if (beds) {
      const b = Number(beds);
      result = result.filter(
        (item) => item.beds && Number(item.beds) >= b
      );
    }
    if (baths) {
      const b = Number(baths);
      result = result.filter(
        (item) => item.baths && Number(item.baths) >= b
      );
    }

    result.sort((a, b) => {
      if (sortBy === "priceLow") {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === "priceHigh") {
        return (b.price || 0) - (a.price || 0);
      }
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return result;
  }, [listings, keyword, minPrice, maxPrice, beds, baths, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            Browse Lease-to-Own Listings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Filter by price, beds, and more to find the right lease-to-own
            property.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-600">
                Search
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="City, address, zip, or keyword"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Min Price
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Max Price
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="$"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Beds (min)
              </label>
              <input
                type="number"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                placeholder="Any"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Baths (min)
              </label>
              <input
                type="number"
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
                placeholder="Any"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
              >
                <option value="newest">Newest first</option>
                <option value="priceLow">Price: Low → High</option>
                <option value="priceHigh">Price: High → Low</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Loading listings…</p>
          ) : filteredListings.length === 0 ? (
            <p className="text-sm text-slate-500">
              No listings match your filters yet. Try adjusting your search.
            </p>
          ) : (
            <>
              <p className="mb-3 text-xs text-slate-500">
                Showing {filteredListings.length} listing
                {filteredListings.length !== 1 && "s"}.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-video bg-slate-100">
                      {listing.imageUrls?.[0] ? (
                        <img
                          src={listing.imageUrls[0]}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {listing.title || "Untitled listing"}
                      </h3>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {listing.address ||
                          listing.city ||
                          listing.zip ||
                          "No address set"}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {listing.beds && `${listing.beds} bd`}
                          {listing.baths && ` • ${listing.baths} ba`}
                          {listing.sqft && ` • ${listing.sqft} sqft`}
                        </span>
                        {listing.price && (
                          <span className="text-sm font-semibold text-sky-600">
                            ${Number(listing.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default SearchListings;
