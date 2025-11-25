// src/pages/CreateListing.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../firebase/listings.js";
import { uploadListingImages } from "../firebase/uploadManager.js";

export default function CreateListing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    address: "",
    price: "",
    downPayment: "",
    description: "",
    featured: false,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadListingImages(imageFiles);
      }

      const payload = {
        title: form.title.trim(),
        address: form.address.trim(),
        price: Number(form.price),
        downPayment: Number(form.downPayment),
        description: form.description.trim(),
        featured: !!form.featured,
        imageUrls,
      };

      const newListingId = await createListing(payload);

      // Allow Cloud Function to process images → AI tagging
      setTimeout(() => {
        navigate(`/listing/${newListingId}`);
      }, 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Create a New Listing
      </h1>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-6"
      >
        {/* TITLE */}
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            className="w-full border rounded-lg px-3 py-2"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* ADDRESS */}
        <div>
          <label className="text-sm font-medium">Address</label>
          <input
            type="text"
            name="address"
            className="w-full border rounded-lg px-3 py-2"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>

        {/* PRICE + DOWN PAYMENT */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Total Price</label>
            <input
              type="number"
              name="price"
              className="w-full border rounded-lg px-3 py-2"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Down Payment</label>
            <input
              type="number"
              name="downPayment"
              className="w-full border rounded-lg px-3 py-2"
              value={form.downPayment}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* FEATURED */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
          />
          <label className="text-sm">Mark as featured</label>
        </div>

        {/* IMAGES */}
        <div>
          <label className="text-sm font-medium">Images</label>
          <input type="file" multiple onChange={handleImagesChange} />

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {imagePreviews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="h-20 w-full object-cover rounded-lg border"
                  alt="preview"
                />
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
