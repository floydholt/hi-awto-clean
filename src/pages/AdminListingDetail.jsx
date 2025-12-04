// src/pages/AdminListingDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getListing } from "../firebase";
import { functions } from "../firebase";
import { httpsCallable } from "firebase/functions";

export default function AdminListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  const approve = async () => {
    try {
      await httpsCallable(functions, "approveListing")({ listingId: id });
      alert("Listing approved!");
    } catch (err) {
      console.error(err);
      alert("Approve failed");
    }
  };

  const reject = async () => {
    try {
      await httpsCallable(functions, "rejectListing")({
        listingId: id,
        reason: "Rejected by admin"
      });
      alert("Listing rejected.");
    } catch (err) {
      console.error(err);
      alert("Reject failed");
    }
  };

  const markFraud = async () => {
    try {
      await httpsCallable(functions, "markFraud")({ listingId: id });
      alert("Listing marked as fraud.");
    } catch (err) {
      console.error(err);
      alert("Fraud action failed");
    }
  };

  const rerunAI = async () => {
    try {
      await httpsCallable(functions, "reRunAI")({ listingId: id });
      alert("AI reprocessing started!");
    } catch (err) {
      console.error(err);
      alert("Failed to run AI");
    }
  };

  useEffect(() => {
    const load = async () => {
      const data = await getListing(id);
      setListing(data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-600 mt-20">
        Loading listing…
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-600 mt-20">
        Listing not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link to="/admin/listings" className="text-blue-600 text-sm">
        ← Back to Listings
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">Admin Review: {listing.title}</h1>

      {listing.imageUrls?.length > 0 ? (
        <img
          src={listing.imageUrls[0]}
          alt=""
          className="w-full h-80 object-cover rounded-lg shadow mb-8"
        />
      ) : (
        <div className="w-full h-80 bg-slate-200 rounded-lg mb-8"></div>
      )}

      <h2 className="text-xl font-semibold">{listing.title}</h2>
      <p className="text-slate-700">{listing.address}</p>

      <p className="text-2xl font-bold text-blue-700 mt-4">
        {listing.price ? `$${Number(listing.price).toLocaleString()}` : "Price not listed"}
      </p>

      <div className="mt-8 bg-yellow-50 p-4 rounded border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-1">AI Fraud Score</h3>
        <p className="text-yellow-800 text-lg">{listing.aiFraud?.score ?? "—"}</p>
      </div>

      {listing.aiFullDescription && (
        <div className="mt-8 bg-slate-50 p-5 rounded border">
          <h3 className="text-xl font-semibold mb-2">AI Generated Description</h3>
          <p className="text-slate-700 whitespace-pre-line">
            {listing.aiFullDescription}
          </p>
        </div>
      )}

      <div className="flex gap-4 mt-10">
        <button
          onClick={approve}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Approve
        </button>

        <button
          onClick={reject}
          className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reject
        </button>

        <button
          onClick={markFraud}
          className="px-5 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Mark Fraud
        </button>

        <button
          onClick={rerunAI}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Re-run AI
        </button>
      </div>

      <div className="mt-8">
        <a
          href={`/listings/${id}`}
          target="_blank"
          rel="noreferrer"
          className="underline text-blue-700"
        >
          View public page →
        </a>
      </div>
    </div>
  );
}
