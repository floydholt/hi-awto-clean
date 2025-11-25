import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllListings } from "../firebase/listings.js";

const FALLBACK_IMG = "/placeholder-listing.jpg";

function isNewListing(listing, days = 14) {
  if (!listing?.createdAt) return false;
  try {
    let created;
    // Firestore Timestamp
    if (typeof listing.createdAt.toMillis === "function") {
      created = new Date(listing.createdAt.toMillis());
    } else {
      created = new Date(listing.createdAt);
    }
    if (!created || Number.isNaN(created.getTime())) return false;
    const diffMs = Date.now() - created.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  } catch {
    return false;
  }
}

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters / sort
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAllListings();
        setListings(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Text search across title + address + description + location
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((l) => {
        const haystack = [
          l.title,
          l.address,
          l.description,
          l.city,
          l.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    // Price filters
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    if (min != null && !Number.isNaN(min)) {
      result = result.filter((l) => {
        const price = l.price != null ? Number(l.price) : null;
        return price == null || price >= min;
      });
    }

    if (max != null && !Number.isNaN(max)) {
      result = result.filter((l) => {
        const price = l.price != null ? Number(l.price) : null;
        return price == null || price <= max;
      });
    }

    if (featuredOnly) {
      result = result.filter((l) => !!l.featured);
    }

    if (newOnly) {
      result = result.filter((l) => isNewListing(l));
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "priceLow":
          return (a.price || 0) - (b.price || 0);
        case "priceHigh":
          return (b.price || 0) - (a.price || 0);
        case "featured": {
          // Featured first, then newest by createdAt
          const featuredDiff = Number(!!b.featured) - Number(!!a.featured);
          if (featuredDiff !== 0) return featuredDiff;
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        }
        case "newest":
        default: {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        }
      }
    });

    return result;
  }, [listings, searchTerm, minPrice, maxPrice, featuredOnly, newOnly, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* HERO */}
        <section className="flex flex-col items-center text-center mb-10">
          <img
            src="/logo.png"
            alt="HI AWTO"
            className="h-28 w-auto mb-4 drop-shadow-sm"
          />
          <p className="text-sm tracking-[0.25em] text-blue-700 font-semibold mb-2">
            HERE IS ANOTHER WAY TO OWN
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Lease-to-Own Homes, Made Simple.
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl">
            Browse flexible lease-to-own properties, compare options, and
            connect with the HI AWTO team to start your path to ownership.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 justify-center">
            <a
              href="#listings"
              className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Browse Listings
            </a>
            <Link
              to="/register"
              className="px-5 py-2 rounded-full border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* FILTERS */}
        <section className="mb-8">
          <div className="bg-white shadow-sm rounded-2xl p-4 md:p-5 border border-slate-100">
            <div className="grid gap-4 md:grid-cols-[2fr,1fr,1fr] mb-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by city, address, or keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Min price */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Min Price
                </label>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="$"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Max price */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Max Price
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="$"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 justify-between">
              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 items-center">
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                  />
                  Featured only
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={newOnly}
                    onChange={(e) => setNewOnly(e.target.checked)}
                  />
                  New in last 14 days
                </label>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide text-right">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-lg px-2 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="featured">Featured first</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* LISTINGS GRID */}
        <section id="listings">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Available Lease-to-Own Listings
            </h2>
            {!loading && (
              <p className="text-xs text-gray-500">
                Showing {filteredListings.length} of {listings.length}
              </p>
            )}
          </div>

          {loading && (
            <p className="text-gray-500 text-sm">Loading listings…</p>
          )}

          {!loading && filteredListings.length === 0 && (
            <p className="text-gray-600 text-sm">
              No listings match your filters. Try adjusting your search.
            </p>
          )}

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => {
              const mainImage =
                (listing.imageUrls && listing.imageUrls[0]) || FALLBACK_IMG;
              const isNew = isNewListing(listing);

              return (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-slate-100 flex flex-col"
                >
                  <div className="relative h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={mainImage}
                      alt={listing.title || "Listing"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />

                    <div className="absolute top-2 left-2 flex gap-1">
                      {listing.featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-400 text-slate-900 shadow">
                          FEATURED
                        </span>
                      )}
                      {isNew && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white shadow">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="font-semibold text-slate-900 text-base line-clamp-1">
                      {listing.title || "Untitled listing"}
                    </h3>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                      {listing.address || "No address provided"}
                    </p>

                    <div className="mt-3">
                      <p className="text-blue-600 font-semibold text-sm">
                        ${listing.price?.toLocaleString?.() || listing.price}{" "}
                        <span className="text-gray-500 font-normal">
                          total
                        </span>
                      </p>
                      <p className="text-green-600 text-xs mt-0.5">
                        $
                        {listing.downPayment?.toLocaleString?.() ||
                          listing.downPayment}{" "}
                        down
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
