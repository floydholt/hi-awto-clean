// src/pages/Listings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllListings } from "../firebase/listings.js";


const FALLBACK_IMG = "/placeholder-listing.jpg";
const NEW_DAYS = 14;

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
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
      } catch (err) {
        console.error("Failed to load listings", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const q = search.trim().toLowerCase();

    let result = listings.filter((l) => {
      const price = typeof l.price === "number" ? l.price : null;

      // Search by title / address / city / state
      const textBlob = [
        l.title,
        l.address,
        l.city,
        l.state,
        l.zip,
        l.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (q && !textBlob.includes(q)) return false;

      if (min !== null && (price === null || price < min)) return false;
      if (max !== null && (price === null || price > max)) return false;

      if (featuredOnly && !l.featured) return false;

      if (newOnly) {
        const createdAt = l.createdAt;
        let createdMs = null;

        if (createdAt?.toMillis) {
          createdMs = createdAt.toMillis();
        } else if (createdAt instanceof Date) {
          createdMs = createdAt.getTime();
        } else if (typeof createdAt === "number") {
          createdMs = createdAt;
        }

        if (!createdMs) return false;

        const ageDays = (now - createdMs) / (1000 * 60 * 60 * 24);
        if (ageDays > NEW_DAYS) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const aCreated = a.createdAt?.toMillis
        ? a.createdAt.toMillis()
        : a.createdAt instanceof Date
        ? a.createdAt.getTime()
        : 0;
      const bCreated = b.createdAt?.toMillis
        ? b.createdAt.toMillis()
        : b.createdAt instanceof Date
        ? b.createdAt.getTime()
        : 0;

      const aPrice = typeof a.price === "number" ? a.price : Infinity;
      const bPrice = typeof b.price === "number" ? b.price : Infinity;

      switch (sortBy) {
        case "priceLow":
          return aPrice - bPrice;
        case "priceHigh":
          return bPrice - aPrice;
        case "newest":
        default:
          return bCreated - aCreated;
      }
    });

    return result;
  }, [listings, search, minPrice, maxPrice, featuredOnly, newOnly, sortBy]);

  const totalCount = listings.length;
  const showingCount = filtered.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* HEADER / HERO STRIP */}
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.25em] text-blue-500 mb-2 uppercase">
          Browse HI AWTO Homes
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Lease-to-Own Homes, Made Simple.
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Filter lease-to-own homes by price, features, and more. When you see a
          place you love, create a free account to start your application.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 mb-8">
        <div className="grid gap-4 md:grid-cols-4 items-end">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by city, address, or keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          {/* Min price */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Min price
            </label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              placeholder="$"
            />
          </div>

          {/* Max price */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Max price
            </label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              placeholder="$"
            />
          </div>
        </div>

        {/* Toggles & sort */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap gap-4 text-xs text-slate-700">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Featured only</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newOnly}
                onChange={(e) => setNewOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>New in last {NEW_DAYS} days</span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            >
              <option value="newest">Newest first</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 text-sm">
        <h2 className="font-semibold text-slate-800">
          Available Lease-to-Own Listings
        </h2>
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold">{showingCount}</span> of{" "}
          <span className="font-semibold">{totalCount}</span> homes
        </p>
      </div>

      {/* RESULT GRID / EMPTY STATES */}
      {loading ? (
        <div className="text-sm text-slate-500">Loading listings…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-500 bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center">
          No listings match your filters. Try adjusting your search or check
          back soon.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing }) {
  const imgSrc =
    Array.isArray(listing.imageUrls) && listing.imageUrls[0]
      ? listing.imageUrls[0]
      : FALLBACK_IMG;

  // "New" badge logic
  let isNew = false;
  const createdAt = listing.createdAt;
  let createdMs = null;
  if (createdAt?.toMillis) {
    createdMs = createdAt.toMillis();
  } else if (createdAt instanceof Date) {
    createdMs = createdAt.getTime();
  } else if (typeof createdAt === "number") {
    createdMs = createdAt;
  }
  if (createdMs) {
    const ageDays = (Date.now() - createdMs) / (1000 * 60 * 60 * 24);
    isNew = ageDays <= NEW_DAYS;
  }

  const price =
    typeof listing.price === "number"
      ? listing.price.toLocaleString()
      : listing.price;

  const downPayment =
    typeof listing.downPayment === "number"
      ? listing.downPayment.toLocaleString()
      : listing.downPayment;

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={listing.title || "Listing"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-2 left-2 flex gap-1">
          {listing.featured && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-white text-[10px] font-semibold shadow-sm">
              FEATURED
            </span>
          )}
          {isNew && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold shadow-sm">
              NEW
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-1">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
          {listing.title || "Untitled listing"}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-1">
          {listing.address || "Address coming soon"}
        </p>
        <p className="text-sm font-semibold text-blue-700 mt-1">
          {price ? `$${price} total` : "Price TBD"}
        </p>
        {downPayment && (
          <p className="text-xs text-green-600">
            ${downPayment} down with lease-to-own terms
          </p>
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          className="w-full text-xs font-semibold rounded-full border border-blue-200 text-blue-700 py-1.5 group-hover:bg-blue-50 transition-colors"
        >
          View details
        </button>
      </div>
    </Link>
  );
}
