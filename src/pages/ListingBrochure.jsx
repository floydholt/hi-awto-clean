// src/pages/ListingBrochure.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firestore.js";

/**
 * Dedicated printable brochure view for a listing.
 * Use the browser's "Print -> Save as PDF" to generate the PDF.
 */
export default function ListingBrochure() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true);
        const ref = doc(db, "listings", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Listing not found.");
          setLoading(false);
          return;
        }
        setListing({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("Failed to load listing for brochure", err);
        setError("Could not load listing.");
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading brochure…</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <p className="text-red-600 text-sm mb-4">{error || "Listing missing."}</p>
        <Link
          to={listing ? `/listing/${listing.id}` : "/"}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
        >
          Back
        </Link>
      </div>
    );
  }

  const {
    title,
    address,
    city,
    state,
    zip,
    price,
    beds,
    baths,
    sqft,
    description,
    aiFullDescription,
    aiPricing,
    aiTags,
    imageUrls = [],
  } = listing;

  const fullAddress =
    address ||
    [city, state, zip].filter(Boolean).join(", ") ||
    "Address not provided";

  const mainPrice = price ? `$${Number(price).toLocaleString()}` : "—";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6 print:bg-white print:py-0">
      {/* PAGE WRAPPER */}
      <div className="w-[900px] max-w-full bg-white shadow-lg print:shadow-none print:w-full print:max-w-none">
        {/* TOOLBAR (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-slate-50 print:hidden">
          <div>
            <h1 className="text-sm font-semibold text-slate-800">
              MLS-Style Brochure Preview
            </h1>
            <p className="text-xs text-slate-500">
              Adjust text & layout in code, then use “Print → Save as PDF”.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/listing/${listing.id}`}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Back to Listing
            </Link>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              🖨 Print / Save as PDF
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-8 print:p-10">
          {/* HEADER ROW */}
          <div className="flex gap-6">
            {/* PHOTOS COLUMN */}
            <div className="w-1/2 space-y-3">
              {imageUrls.length > 0 ? (
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src={imageUrls[0]}
                    alt={title || "Property photo"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] w-full rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                  No primary photo
                </div>
              )}

              {imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {imageUrls.slice(1, 5).map((url, idx) => (
                    <div
                      key={idx}
                      className="h-16 rounded border border-slate-200 overflow-hidden"
                    >
                      <img
                        src={url}
                        alt="Additional property"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DETAILS COLUMN */}
            <div className="w-1/2 flex flex-col">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                  {title || "Untitled Listing"}
                </h2>
                <p className="text-sm text-slate-600 mb-2">{fullAddress}</p>
                <p className="text-3xl font-bold text-blue-700 mb-4">
                  {mainPrice}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                <InfoPill label="Beds" value={beds ?? "—"} />
                <InfoPill label="Baths" value={baths ?? "—"} />
                <InfoPill
                  label="Square Feet"
                  value={sqft ? sqft.toLocaleString() : "—"}
                />
              </div>

              {aiTags && aiTags.length > 0 && (
                <div className="mt-auto">
                  <p className="text-[11px] font-semibold text-slate-700 mb-1">
                    Highlights
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {aiTags.slice(0, 10).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTION / AI DESCRIPTION */}
          <div className="grid grid-cols-5 gap-6">
            {/* MAIN DESCRIPTION */}
            <div className="col-span-3">
              <SectionTitle>Property Description</SectionTitle>
              <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">
                {aiFullDescription || description || "No description provided."}
              </p>
            </div>

            {/* AI PRICING SUMMARY */}
            <div className="col-span-2">
              <SectionTitle>AI Pricing Snapshot</SectionTitle>
              {aiPricing ? (
                <div className="border border-slate-200 rounded-lg p-3 text-[11px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">AI Estimate</span>
                    <span className="font-semibold text-slate-900">
                      $
                      {Number(aiPricing.estimate || 0).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 0 }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Range</span>
                    <span className="text-slate-900">
                      $
                      {Number(aiPricing.low || 0).toLocaleString()} – $
                      {Number(aiPricing.high || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Down Payment (suggested)</span>
                    <span className="text-slate-900">
                      $
                      {Number(aiPricing.downPayment || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Confidence: </span>
                    <span className="font-medium">
                      {aiPricing.confidence || "—"}
                    </span>
                  </div>
                  {aiPricing.reasoning && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      {aiPricing.reasoning}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  AI pricing details are not available for this listing.
                </p>
              )}
            </div>
          </div>

          {/* OPTIONAL: FOOTER / BRANDING */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span>HI-AWTO · Lease-to-Own Marketplace</span>
            <span>Powered by Gemini AI · Internal brochure preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
      {children}
    </h3>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="border border-slate-200 rounded-lg px-2 py-2 flex flex-col">
      <span className="text-[9px] uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}
