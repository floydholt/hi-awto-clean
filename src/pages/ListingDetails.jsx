// src/pages/ListingDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const ListingDetails = () => {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [listingError, setListingError] = useState("");

  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [leadStatus, setLeadStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });

  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoadingListing(true);
        setListingError("");

        const ref = doc(db, "listings", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setListingError("Listing not found.");
          setListing(null);
        } else {
          setListing({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Error loading listing:", err);
        setListingError("There was a problem loading this listing.");
      } finally {
        setLoadingListing(false);
      }
    };

    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
  {listing?.imageUrls?.length > 0 ? (
    <img
      src={listing.imageUrls[0]}
      alt={listing.title}
      className="w-full h-full object-cover"
      onError={(e) => (e.target.src = "/placeholder-listing.jpg")}
    />
  ) : (
    <img
      src="/placeholder-listing.jpg"
      alt="No image available"
      className="w-full h-full object-cover opacity-80"
    />
  )}
</div>



    if (id) loadListing();
  }, [id]);

  const handleLeadChange = (e) => {
    const { name, value } = e.target;
    setLeadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!listing) return;

    try {
      setLeadStatus({ loading: true, success: "", error: "" });

      await addDoc(collection(db, "leads"), {
        listingId: listing.id,
        listingTitle: listing.title || "",
        listingAddress: listing.address || "",
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        message: leadForm.message,
        createdAt: serverTimestamp(),
        status: "new",
        source: "public-listing-page",
      });

      setLeadStatus({
        loading: false,
        success: "Thanks! We’ve received your inquiry.",
        error: "",
      });

      setLeadForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      console.error("Error submitting lead:", err);
      setLeadStatus({
        loading: false,
        success: "",
        error: "There was a problem sending your request. Please try again.",
      });
    }
  };

  if (loadingListing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-sm text-slate-500">Loading listing…</p>
        </main>
      </div>
    );
  }

  if (listingError || !listing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-sm text-red-600">
            {listingError || "Listing not found."}
          </p>
        </main>
      </div>
    );
  }

  const mainImage = listing.imageUrls?.[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            {listing.title || "Lease-to-Own Home"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {listing.address ||
              [listing.city, listing.state, listing.zip]
                .filter(Boolean)
                .join(", ") ||
              "Address not specified"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-700">
            <span className="font-semibold text-sky-700">
              {listing.price
                ? `$${Number(listing.price).toLocaleString()} total`
                : "Price on request"}
            </span>
            <span className="text-slate-400">•</span>
            {listing.beds && <span>{listing.beds} bd</span>}
            {listing.baths && <span>{listing.baths} ba</span>}
            {listing.sqft && <span>{listing.sqft} sqft</span>}
          </div>
        </header>

        <section className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-slate-100">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={listing.title}
                  className="h-72 w-full object-cover md:h-96"
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center text-sm text-slate-400 md:h-96">
                  No image available
                </div>
              )}
            </div>

            {listing.imageUrls && listing.imageUrls.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {listing.imageUrls.slice(1).map((url, idx) => (
                  <div
                    key={idx}
                    className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100"
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${idx + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Ask about this home
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Tell us a little about yourself and we’ll connect you with the HI
              AWTO team.
            </p>

            {leadStatus.success && (
              <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {leadStatus.success}
              </div>
            )}
            {leadStatus.error && (
              <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                {leadStatus.error}
              </div>
            )}

            <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={leadForm.name}
                  onChange={handleLeadChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={leadForm.email}
                  onChange={handleLeadChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={leadForm.phone}
                  onChange={handleLeadChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Message
                </label>
                <textarea
                  name="message"
                  value={leadForm.message}
                  onChange={handleLeadChange}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-sky-400"
                  placeholder="I’m interested in this property. Please tell me more about monthly payments and options."
                />
              </div>
              <button
                type="submit"
                disabled={leadStatus.loading}
                className="mt-2 w-full rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {leadStatus.loading ? "Sending…" : "Send message"}
              </button>
            </form>
          </aside>
        </section>

        <section className="mb-12 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">
              About this home
            </h2>
            <p className="text-sm text-slate-700">
              {listing.description ||
                "No description has been added yet. Contact the HI AWTO team to learn more about this home and how lease-to-own works for this property."}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-900">
              Highlights
            </h2>
            <ul className="space-y-1 text-xs text-slate-600">
              {listing.beds && <li>{listing.beds} bedrooms</li>}
              {listing.baths && <li>{listing.baths} bathrooms</li>}
              {listing.sqft && <li>{listing.sqft} square feet</li>}
              {listing.zip && <li>Zip code {listing.zip}</li>}
              <li>Flexible path to home ownership</li>
              <li>Personalized support from the HI AWTO team</li>
            </ul>
          </div>
        </section>

        <section className="mb-16 rounded-2xl border border-dashed border-slate-300 bg-slate-100/60 p-6 text-sm text-slate-600">
          <p className="font-medium text-slate-800">
            Neighborhood & Map (coming soon)
          </p>
          <p className="mt-2 text-xs text-slate-600">
            We’ll show school information, commute times, and an interactive
            map here. For now, reach out and we’ll share more details about the
            area and nearby amenities.
          </p>
        </section>
      </main>
    </div>
  );
};

export default ListingDetails;
