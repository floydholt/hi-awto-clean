// src/components/SimilarHomes.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllListings } from "../firebase/listings.js";

/**
 * Simple AI-powered similarity:
 * - Uses aiTags (from Vision) + price closeness
 * - Ranks all other listings
 * - Shows top 3 similar homes
 */
export default function SimilarHomes({ listingId, tags = [], price = null }) {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllListings();
        const targetTags = Array.isArray(tags) ? tags.map((t) => t.toLowerCase()) : [];
        const targetPrice = typeof price === "number" ? price : null;

        const candidates = all.filter((l) => l.id !== listingId);

        const scored = candidates.map((l) => {
          let score = 0;

          // Tag overlap (AI tags)
          if (Array.isArray(l.aiTags) && targetTags.length > 0) {
            const otherTags = l.aiTags.map((t) => t.toLowerCase());
            const intersection = otherTags.filter((t) => targetTags.includes(t));
            score += intersection.length * 2; // tags are strong similarity signal
          }

          // Price similarity
          if (targetPrice && typeof l.price === "number") {
            const diff = Math.abs(l.price - targetPrice);
            const ratio = diff / targetPrice;
            const priceScore = Math.max(0, 1 - ratio); // 1 = same price, 0 = very far
            score += priceScore; // add soft influence
          }

          return { listing: l, score };
        });

        // Filter out very low similarity
        const filtered = scored
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((x) => x.listing);

        setSimilar(filtered);
      } catch (err) {
        console.error("SimilarHomes error:", err);
      }
    })();
  }, [listingId, tags, price]);

  if (!similar.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-slate-800 mb-3">
        Similar homes you might like
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {similar.map((h) => (
          <Link
            key={h.id}
            to={`/listing/${h.id}`}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"
          >
            {h.imageUrls?.[0] && (
              <img
                src={h.imageUrls[0]}
                alt={h.title || "Similar home"}
                className="h-32 w-full object-cover"
              />
            )}
            <div className="p-3 flex flex-col gap-1">
              <div className="text-sm font-semibold truncate">
                {h.title || "Untitled home"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {h.address || "Address not provided"}
              </div>
              {typeof h.price === "number" && (
                <div className="text-sm text-blue-600 font-semibold">
                  ${h.price.toLocaleString()}
                </div>
              )}

              {Array.isArray(h.aiTags) && h.aiTags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-blue-700">
                  {h.aiTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
