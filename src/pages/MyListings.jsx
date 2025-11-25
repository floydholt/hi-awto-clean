// src/pages/MyListings.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyListings } from "../firebase/listings.js";
import { useAuth } from "../firebase/AuthContext.jsx";

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getMyListings(user.uid);
      setListings(data);
    })();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">My Listings</h1>

      {listings.length === 0 && (
        <p className="text-gray-600">You haven't created any listings yet.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {listings.map((l) => (
          <Link
            key={l.id}
            to={`/listing/${l.id}`}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
          >
            {l.imageUrls?.[0] && (
              <img
                src={l.imageUrls[0]}
                className="h-40 w-full object-cover rounded-xl mb-3"
                alt={l.title}
              />
            )}

            <h2 className="text-xl font-semibold">{l.title}</h2>
            <p className="text-gray-600 text-sm">{l.address}</p>

            <p className="text-blue-600 font-semibold mt-1">
              ${l.price?.toLocaleString()}
            </p>

            {/* AI tags */}
            {l.aiTags && l.aiTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 text-[11px] text-blue-700">
                {l.aiTags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full"
                  >
                    #{t}
                  </span>
                ))}
                {l.aiTags.length > 4 && (
                  <span className="px-2 py-0.5 bg-blue-100 rounded-full">
                    +{l.aiTags.length - 4}
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
