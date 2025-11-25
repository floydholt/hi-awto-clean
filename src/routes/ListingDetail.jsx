// client/src/routes/ListingDetail.jsx
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useParams, Link } from "react-router-dom";

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const d = await getDoc(doc(db, "listings", id));
      if (mounted) {
        setListing(d.exists() ? { id: d.id, ...d.data() } : null);
        setIndex(0);
        setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (!listing) return <p>Listing not found. <Link to="/listings">Back to listings</Link></p>;

  const photos = listing.photos || [];
  const next = () => setIndex((i) => (i + 1) % Math.max(photos.length, 1));
  const prev = () => setIndex((i) => (i - 1 + Math.max(photos.length, 1)) % Math.max(photos.length, 1));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="relative">
          {photos.length ? (
            <>
              <img src={photos[index]} alt="" className="w-full h-96 object-cover" loading="lazy" />
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded">‹</button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded">›</button>
            </>
          ) : (
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-500">No photos</div>
          )}
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold">{listing.address}</h1>
          <p className="text-gray-600">{listing.city}, {listing.state} {listing.zip}</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><strong>Price</strong><div>${listing.price?.toLocaleString?.() ?? listing.price}</div></div>
            <div><strong>Monthly Rent</strong><div>${listing.rent?.toLocaleString?.() ?? listing.rent}</div></div>
            <div><strong>Listed</strong><div>{listing.createdAt?.toDate ? listing.createdAt.toDate().toLocaleDateString() : "—"}</div></div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Description</h3>
            <p className="mt-2 text-gray-700">{listing.description || "No description provided."}</p>
          </div>

          <div className="mt-6">
            <Link to="/listings" className="text-blue-600">← Back to listings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
