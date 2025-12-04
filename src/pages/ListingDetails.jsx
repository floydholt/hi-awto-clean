// src/pages/ListingDetails.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getListing } from "../firebase";        // ✅ FIXED IMPORT
import { useAuth } from "../firebase/AuthContext";

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Image carousel index
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = await getListing(id);
      setListing(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const images = listing?.imageUrls || [];

  const nextImage = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 text-center text-slate-600">
        Loading listing…
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 text-center text-slate-600">
        Listing not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* MAIN IMAGE */}
      <div className="relative w-full h-80 md:h-[450px] bg-black rounded-lg overflow-hidden mb-6">
        {images.length > 0 ? (
          <img
            src={images[index]}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200" />
        )}

        {/* Left arrow */}
        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/50 hover:bg-white text-black p-2 rounded-full"
          >
            ‹
          </button>
        )}

        {/* Right arrow */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/50 hover:bg-white text-black p-2 rounded-full"
          >
            ›
          </button>
        )}
      </div>

      {/* TITLE & PRICE */}
      <h1 className="text-3xl font-bold">{listing.title}</h1>
      <p className="text-lg text-slate-700 mt-1">{listing.address}</p>

      <p className="mt-4 text-2xl font-semibold text-blue-600">
        {listing.price
          ? `$${Number(listing.price).toLocaleString()}`
          : "Price not listed"}
      </p>

      {/* PROPERTY DETAILS */}
      <div className="grid grid-cols-3 gap-4 mt-6 text-center">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-bold">{listing.beds ?? "—"}</p>
          <p className="text-slate-600 text-sm">Beds</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-bold">{listing.baths ?? "—"}</p>
          <p className="text-slate-600 text-sm">Baths</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-bold">
            {listing.sqft ? listing.sqft.toLocaleString() : "—"}
          </p>
          <p className="text-slate-600 text-sm">SqFt</p>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">Description</h2>
        <p className="text-slate-700 whitespace-pre-line">
          {listing.description || "No description provided."}
        </p>
      </div>

      {/* AI DESCRIPTION */}
      {listing.aiFullDescription && (
        <div className="mt-10 bg-indigo-50 p-5 rounded-lg">
          <h2 className="text-xl font-bold mb-2">AI Generated Description</h2>
          <p className="text-slate-700 whitespace-pre-line">
            {listing.aiFullDescription}
          </p>
        </div>
      )}

      {/* CONTACT CTA */}
      {user && user.uid !== listing.uid && (
        <div className="mt-10">
          <a
            href={`/messages?listing=${id}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow"
          >
            Contact Seller →
          </a>
        </div>
      )}
    </div>
  );
}
