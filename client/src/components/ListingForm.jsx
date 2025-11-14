import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ListingForm({ listing, onSave, onCancel }) {
  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    rent: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    terms: "",
    photos: [],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (listing) setForm(listing);
  }, [listing]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    setUploading(true);
    const files = Array.from(e.target.files);
    const uploadedUrls = [];

    for (const file of files) {
      const fileRef = ref(storage, `listing_photos/${file.name}-${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      uploadedUrls.push(url);
    }

    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...uploadedUrls],
    }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (listing?.id) {
      await updateDoc(doc(db, "listings", listing.id), {
        ...form,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "listings"), {
        ...form,
        createdAt: serverTimestamp(),
      });
    }

    setForm({
      address: "",
      city: "",
      state: "",
      rent: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      terms: "",
      photos: [],
    });

    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
      <h3 className="text-xl font-semibold mb-2">
        {listing ? "Edit Listing" : "Add New Listing"}
      </h3>

      {["address", "city", "state", "rent", "price", "bedrooms", "bathrooms"].map(
        (field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={form[field] || ""}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        )
      )}

      <textarea
        name="terms"
        value={form.terms}
        onChange={handleChange}
        placeholder="Lease-to-own terms"
        className="w-full p-2 border rounded-lg"
      />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="w-full border p-2 rounded-lg"
      />
      {uploading && <p>Uploading images...</p>}

      <div className="flex flex-wrap gap-2 mt-2">
        {form.photos.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt="preview"
            className="w-20 h-20 object-cover rounded-md"
          />
        ))}
      </div>

      <div className="flex gap-3 mt-3">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          {listing ? "Update" : "Create"}
        </button>
        {listing && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
