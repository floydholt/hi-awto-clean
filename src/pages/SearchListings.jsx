// src/pages/SearchListings.jsx
import React, { useEffect, useState } from "react";
import { getListings, searchListings } from "../firebase";
import { Link } from "react-router-dom";

export default function SearchListings() {
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState([]);
  const [results, setResults] = useState([]);

  // Load all listings on mount
  useEffect(() => {
    (async () => {
      const all = await getListings();
      setListings(all);
      setResults(all);
    })();
  }, []);

  // When query changes, run search or reset
  useEffect(() => {
    if (!query.trim()) {
      setResults(listings);
      return;
    }

    const run = async () => {
      try {
        const r = await searchListings(query.toLowerCase());
        setResults(r);
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    run();
  }, [query, listings]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Search Homes</h1>

      <input
        type="text"
        placeholder="Search by address, city, keyword, or feature…"
        className="w-full border rounded-lg px-4 py-2 mb-6 text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {results.map((l) => (
          <Link
            key={l.id}
            to={`/listings/${l.id}`}
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

            {/* AI Tags */}
            {l.aiTags && l.aiTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 text-[11px] text-blue-700">
                {l.aiTags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
