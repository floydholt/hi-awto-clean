// client/src/components/ListingCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  const photos = listing.photos || [];
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % Math.max(photos.length, 1));
  const prev = () =>
    setIndex((i) => (i - 1 + Math.max(photos.length, 1)) % Math.max(photos.length, 1));

  const formattedPrice = listing.price ? Number(listing.price).toLocaleString() : "—";

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative">
        {photos.length ? (
          <>
            <img
              src={photos[index]}
              alt={listing.address || "Listing"}
              className="w-full h-44 object-cover"
              loading="lazy"
            />
            {/* dots */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
              {photos.map((_, i) => (
                <button
                  key={i}
                  aria-label={`go to image ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/60"}`}
                />
              ))}
            </div>

            {/* simple nav */}
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-1 rounded"
              aria-label="previous"
              title="Previous"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-1 rounded"
              aria-label="next"
              title="Next"
            >
              ›
            </button>
          </>
        ) : (
          <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-500">
            No photo
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold">{listing.address || "Untitled"}</h3>
        <p className="text-sm text-gray-600">{listing.city}, {listing.state}</p>
        <p className="mt-2"><strong>Price:</strong> ${formattedPrice}</p>
        <div className="mt-3 flex gap-2">
          <Link
            to={`/listing/${listing.id}`}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
