import React, { useState } from "react";
import { auth, db, storage } from "../../firebase/firebase";

import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("listings");

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Seller Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${activeTab === "listings" ? "bg-sky-600 text-white" : "bg-slate-200"}`}
          onClick={() => setActiveTab("listings")}
        >
          Listings
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "brochures" ? "bg-sky-600 text-white" : "bg-slate-200"}`}
          onClick={() => setActiveTab("brochures")}
        >
          Brochures
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "analytics" ? "bg-sky-600 text-white" : "bg-slate-200"}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "listings" && <ListingsModule />}
      {activeTab === "brochures" && <BrochuresModule />}
      {activeTab === "analytics" && <AnalyticsModule />}
    </div>
  );
}

/* -----------------------------
   Listings Management Module
----------------------------- */
function ListingsModule() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("draft");

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "listings"), {
        ownerId: auth.currentUser.uid,
        title,
        price,
        status,
        createdAt: Date.now(),
      });
      alert("Listing created!");
      setTitle("");
      setPrice("");
      setStatus("draft");
    } catch (err) {
      console.error(err);
      alert("Error creating listing");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Listings</h2>
      <form onSubmit={handleCreateListing} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border p-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <select
          className="w-full border p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded">
          Create Listing
        </button>
      </form>
    </div>
  );
}

/* -----------------------------
   Brochure Upload Module
----------------------------- */
function BrochuresModule() {
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const fileRef = ref(storage, `brochures/${auth.currentUser.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, "brochures"), {
        ownerId: auth.currentUser.uid,
        fileName: file.name,
        url,
        uploadedAt: Date.now(),
      });

      alert("Brochure uploaded!");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Error uploading brochure");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upload Brochures</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          className="w-full"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded">
          Upload
        </button>
      </form>
    </div>
  );
}

/* -----------------------------
   Analytics Module
----------------------------- */
function AnalyticsModule() {
  // Placeholder values — later connect to Firestore analytics
  const views = 42;
  const leads = 7;
  const downloads = 15;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="p-4 border rounded text-center">
          <h3 className="font-bold">Views</h3>
          <p className="text-2xl">{views}</p>
        </div>
        <div className="p-4 border rounded text-center">
          <h3 className="font-bold">Leads</h3>
          <p className="text-2xl">{leads}</p>
        </div>
        <div className="p-4 border rounded text-center">
          <h3 className="font-bold">Brochure Downloads</h3>
          <p className="text-2xl">{downloads}</p>
        </div>
      </div>
    </div>
  );
}
