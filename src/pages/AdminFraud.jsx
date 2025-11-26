// src/pages/AdminFraud.jsx
import React, { useEffect, useState } from "react";
import {
  listenToFraudListings,
  markListingSafe,
  flagAsFraud,
} from "../firebase/adminFraud.js";
import { Link } from "react-router-dom";

export default function AdminFraud() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = listenToFraudListings(setItems);
    return () => unsub();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">AI Fraud Review</h1>
      <p className="text-gray-600 mb-8">
        Review suspicious listings detected by the AI pipeline.
      </p>

      <div className="space-y-4">
        {items.map((item) => (
          <FraudCard key={item.id} listing={item} />
        ))}
      </div>
    </div>
  );
}

function FraudCard({ listing }) {
  const {
    id,
    title,
    imageUrls,
    fraudScore,
    fraudReasons = [],
    fraudSummary = "",
    ownerId,
    fraudStatus = "flagged"
  } = listing;

  const thumbnail =
    (imageUrls && imageUrls[0]) || "/placeholder-listing.jpg";

  const riskColor =
    fraudScore >= 80
      ? "text-red-600"
      : fraudScore >= 50
      ? "text-yellow-600"
      : "text-blue-600";

  return (
    <div className="p-4 bg-white shadow rounded-xl border border-gray-200">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-28 h-20 rounded-lg overflow-hidden">
          <img
            src={thumbnail}
            className="w-full h-full object-cover"
            alt="listing"
          />
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-gray-500">Listing ID: {id}</div>
          <div className="text-xs text-gray-500">Owner: {ownerId}</div>

          {/* Fraud Score */}
          <div className="mt-2 text-sm">
            <span className="font-semibold">Fraud Score: </span>
            <span className={`${riskColor} font-bold`}>
              {fraudScore ?? "N/A"}
            </span>
          </div>

          {/* AI Summary */}
          {fraudSummary && (
            <div className="mt-2 text-xs bg-orange-50 border border-orange-100 rounded-lg p-2">
              <p className="font-semibold text-orange-700 mb-1">
                AI Summary
              </p>
              <p className="text-orange-800">{fraudSummary}</p>
            </div>
          )}

          {/* Reasons */}
          {fraudReasons.length > 0 && (
            <div className="mt-2 text-xs">
              <p className="font-semibold text-gray-700">Risk Factors:</p>
              <ul className="list-disc ml-4 text-gray-600">
                {fraudReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 text-right">
          <Link
            to={`/listing/${id}`}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg"
          >
            View Listing
          </Link>

          {fraudStatus !== "safe" && (
            <button
              onClick={() => markListingSafe(id)}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg"
            >
              Mark Safe
            </button>
          )}

          {fraudStatus !== "fraud" && (
            <button
              onClick={() => flagAsFraud(id)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg"
            >
              Flag as Fraud
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
