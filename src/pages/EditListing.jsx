// src/pages/EditListing.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getListing, updateListing } from "../firebase/listings.js";
import { uploadListingImages } from "../firebase/uploadManager.js";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    address: "",
    price: "",
    downPayment: "",
    description: "",
    featured: false,
  });

  const [existingImages, setExistingImages] = useState([]); // string[]
  const [newImageFiles, setNewImageFiles] = useState([]); // File[]
  const [newImagePreviews, setNewImagePreviews] = useState([]); // object URLs

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load listing
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getListing(id);
        if (!data) {
          setError("Listing not found.");
          return;
        }

        setForm({
          title: data.title || "",
          address: data.address || "",
          price: data.price ?? "",
          downPayment: data.downPayment ?? "",
          description: data.description || "",
          featured: !!data.featured,
        });

        setExistingImages(Array.isArray(data.imageUrls) ? data.imageUrls : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load listing.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles(files);
    setNewImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let imageUrls = existingImages;

      // If the user picked new images, replace the set
      if (newImageFiles.length > 0) {
        imageUrls = await uploadListingImages(newImageFiles);
      }

      const payload = {
        title: form.title.trim(),
        address: form.address.trim(),
        price: form.price ? Number(form.price) : null,
        downPayment: form.downPayment ? Number(form.downPayment) : null,
        description: form.description.trim(),
        featured: !!form.featured,
        imageUrls,
      };

      await updateListing(id, payload);
      navigate("/my-listings");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to update listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-500">Loading listing…</p>
      </div>
    );
  }

  if (error && !form.title) {
    // Hard error, before the form is even usable
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-red-600 mb-2">{error}</p>
        <Link to="/my-listings" className="text-blue-600 hover:underline">
          ← Back to my listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Edit Listing
        </h1>
        <Link
          to="/my-listings"
          className="text-blue-600 text-sm hover:underline"
        >
          ← Back to my listings
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-xl shadow"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        {/* Price + Down payment */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Price
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment
            </label>
            <input
              type="number"
              name="downPayment"
              value={form.downPayment}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              min="0"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Describe the property, neighborhood, and lease-to-own terms."
          />
        </div>

        {/* Featured toggle */}
        <div className="flex items-center gap-2">
          <input
            id="featured"
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="featured" className="text-sm text-gray-700">
            Mark as featured
          </label>
        </div>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Images
            </label>
            <div className="mt-2 grid grid-cols-3 md:grid-cols-4 gap-2">
              {existingImages.map((url, idx) => (
                <div
                  key={idx}
                  className="relative h-20 rounded overflow-hidden border"
                >
                  <img
                    src={url}
                    alt={`Existing ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              If you upload new images below, these will be replaced.
            </p>
          </div>
        )}

        {/* New images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Replace Images (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            className="block text-sm text-gray-600"
          />
          <p className="text-xs text-gray-400 mt-1">
            Leave this empty to keep the current images.
          </p>

          {newImagePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-2">
              {newImagePreviews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative h-20 rounded overflow-hidden border"
                >
                  <img
                    src={src}
                    alt={`New preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Saving changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
