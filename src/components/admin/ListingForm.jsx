// client/src/components/admin/ListingForm.jsx
import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import ImageUploader from "../../components/ImageUploader";
import PhotoReorder from "../../components/PhotoReorder";

export default function ListingForm({ listing = null, onSaved = () => {}, onCancel = () => {} }) {
  const isEdit = !!listing?.id;

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [price, setPrice] = useState("");
  const [rent, setRent] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!listing) return;
    setAddress(listing.address || "");
    setCity(listing.city || "");
    setStateVal(listing.state || "");
    setZip(listing.zip || "");
    setPrice(listing.price || "");
    setRent(listing.rent || "");
    setDescription(listing.description || "");
    setPhotos(listing.photos || []);
  }, [listing]);

  const handleUploadComplete = (url) => {
    setPhotos((p) => [...p, url]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      address,
      city,
      state: stateVal,
      zip,
      price: Number(price || 0),
      rent: Number(rent || 0),
      description,
      photos,
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEdit) {
        await updateDoc(doc(db, "listings", listing.id), payload);
      } else {
        await addDoc(collection(db, "listings"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      onSaved();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed. See console.");
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">{isEdit ? "Edit Listing" : "Add Listing"}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <input className="input" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <input className="input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
          <input className="input" placeholder="State" value={stateVal} onChange={(e) => setStateVal(e.target.value)} />
          <input className="input" placeholder="Zip" value={zip} onChange={(e) => setZip(e.target.value)} />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input className="input" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="input" type="number" placeholder="Monthly Rent" value={rent} onChange={(e) => setRent(e.target.value)} />
        </div>

        <textarea className="input" rows="4" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div>
          <h4 className="font-medium mb-2">Photos</h4>
          <ImageUploader onUploadComplete={handleUploadComplete} folder="listings" />
          <div className="mt-3">
            <PhotoReorder photos={photos} setPhotos={setPhotos} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>Cancel</button>
          <button type="submit" className="button">{isEdit ? "Update Listing" : "Create Listing"}</button>
        </div>
      </form>
    </div>
  );
}
