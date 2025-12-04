// src/pages/AdminListingEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getListing, saveDocument } from "../firebase";

export default function AdminListingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getListing(id);
      setListing(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleChange = (field, value) => {
    setListing((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await saveDocument(`listings/${id}`, listing);
      alert("Listing updated!");
      navigate(`/admin/listings/${id}`);
    } catch (err) {
      console.error(err);
      alert("Error updating listing");
    }

    setSaving(false);
  };

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
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to={`/admin/listings/${id}`} className="text-blue-600 text-sm">
        ← Back to Listing
      </Link>

      <h1 className="text-3xl font-bold mt-3 mb-8">
        Edit Listing
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold">Title</label>
          <input
            type="text"
            value={listing.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        <div>
          <label className="block font-semibold">Address</label>
          <input
            type="text"
            value={listing.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        <div>
          <label className="block font-semibold">Price</label>
          <input
            type="number"
            value={listing.price || ""}
            onChange={(e) => handleChange("price", Number(e.target.value))}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        <div>
          <label className="block font-semibold">Beds</label>
          <input
            type="number"
            value={listing.beds || ""}
            onChange={(e) => handleChange("beds", Number(e.target.value))}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        <div>
          <label className="block font-semibold">Baths</label>
          <input
            type="number"
            value={listing.baths || ""}
            onChange={(e) => handleChange("baths", Number(e.target.value))}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        <div>
          <label className="block font-semibold">SqFt</label>
          <input
            type="number"
            value={listing.sqft || ""}
            onChange={(e) => handleChange("sqft", Number(e.target.value))}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        <div>
          <label className="block font-semibold">Description</label>
          <textarea
            rows={5}
            value={listing.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        <div>
          <label className="block font-semibold">Status</label>
          <select
            value={listing.status || "pending"}
            onChange={(e) => handleChange("status", e.target.value)}
            className="border p-2 w-full rounded mt-1"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="fraud">Fraud</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
