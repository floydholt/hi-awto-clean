import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      const ref = doc(db, "listings", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setListing({ id: snap.id, ...snap.data() });
    };
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (!listing?.photos?.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % listing.photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [listing?.photos]);

  if (!listing) return <p className="p-6">Loading listing...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="relative h-96 rounded-lg overflow-hidden mb-4">
        {listing.photos?.length > 0 ? (
          <>
            <img
              src={listing.photos[index]}
              alt={listing.address}
              className="w-full h-96 object-cover transition-all"
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
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
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500">
            No photos
          </div>
        )}
      </div>

      <h2 className="text-3xl font-bold">{listing.address}</h2>
      <p className="text-lg text-gray-600 mb-3">
        {listing.city}, {listing.state}
      </p>

      <div className="bg-white shadow p-4 rounded-lg">
        <p className="text-gray-700 mb-2">
          <strong>Rent:</strong> ${listing.rent?.toLocaleString()}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Lease-to-own Price:</strong> ${listing.price?.toLocaleString()}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Bedrooms:</strong> {listing.bedrooms} |{" "}
          <strong>Bathrooms:</strong> {listing.bathrooms}
        </p>
        <p className="text-gray-700 mt-4 whitespace-pre-line">
          {listing.terms || "No additional terms provided."}
        </p>
      </div>
    </div>
  );
}
