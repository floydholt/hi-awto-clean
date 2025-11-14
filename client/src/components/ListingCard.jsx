import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  const [index, setIndex] = useState(0);

  // Auto-scroll carousel
  useEffect(() => {
    if (!listing.photos?.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % listing.photos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [listing.photos]);

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="block border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition bg-white"
    >
      {/* Image Carousel */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {listing.photos && listing.photos.length > 0 ? (
          <>
            <img
              src={listing.photos[index]}
              alt={listing.address}
              loading="lazy"
              className="w-full h-56 object-cover transition-opacity"
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {listing.photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === index ? "bg-white" : "bg-gray-400"
                  }`}
                ></div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-56 flex items-center justify-center text-gray-400">
            No photo
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{listing.address}</h3>
        <p className="text-gray-600">
          {listing.city}, {listing.state}
        </p>
        <p className="mt-1 text-gray-800 font-medium">
          Rent: ${listing.rent?.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">Lease-to-own Price: ${listing.price?.toLocaleString()}</p>
      </div>
    </Link>
  );
}
