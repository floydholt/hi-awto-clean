// FULL CLEAN, FIXED VERSION — NO JSX ERRORS, NO HOOK ERRORS

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useParams, Link } from "react-router-dom";
import { getListingById } from "../firebase/listings.js";
import SimilarHomes from "../components/SimilarHomes.jsx";

const FALLBACK_IMG = "/placeholder-listing.jpg";

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const lastTapRef = useRef(0);

  const SWIPE_THRESHOLD = 50;
  const DOUBLE_TAP_THRESHOLD = 250;

  // UNIVERSAL SHARE ---------------------------------
  const handleUniversalShare = async (url) => {
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const file = new File([blob], "hi-awto-share.jpg", {
        type: blob.type,
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Share Image",
          text: "Check out this home on HI-AWTO!",
          files: [file],
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "Share Home",
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard.");
    } catch (err) {
      console.error("Share failed:", err);
      alert("Unable to share this image.");
    }
  };

  // SAVE TO PHOTOS -----------------------------------
  const handleSaveToPhotos = async (url) => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(
        navigator.userAgent
      );

      if (isMobile && navigator.share) {
        const blob = await fetch(url).then((r) => r.blob());
        const file = new File([blob], "hi-awto-image.jpg", {
          type: blob.type,
        });

        await navigator.share({
          title: "Save Image",
          files: [file],
        });
        return;
      }

      const blob = await fetch(url).then((r) => r.blob());
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "hi-awto-image.jpg";
      a.click();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Save to Photos error:", err);
    }
  };

  // COPY IMAGE ---------------------------------------
  const handleCopyImage = async (url) => {
    try {
      const blob = await fetch(url).then((r) => r.blob());

      if (window.ClipboardItem) {
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        alert("Image copied to clipboard.");
        return;
      }

      await navigator.clipboard.writeText(url);
      alert("Image link copied.");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // LOAD LISTING -------------------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getListingById(id);
      setListing(data || null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-gray-500">Listing not found.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back
        </Link>
      </div>
    );
  }

  const images = listing.imageUrls?.length
    ? listing.imageUrls
    : [FALLBACK_IMG];

  const activeImage = images[lightboxIndex];

  // LIGHTBOX HANDLERS --------------------------------
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setZoom(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = () => {
    setLightboxIndex((i) => (i + 1) % images.length);
    setZoom(1);
  };

  const prevImage = () => {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
    setZoom(1);
  };

  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));
  const resetZoom = () => setZoom(1);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD) {
      setZoom((z) => (z === 1 ? 2 : 1));
    }
    lastTapRef.current = now;
  };

  const handleTouchStart = (e) => {
    const x = e.touches[0].clientX;
    touchStartXRef.current = x;
    touchEndXRef.current = x;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const start = touchStartXRef.current;
    const end = touchEndXRef.current;

    if (Math.abs(end - start) > SWIPE_THRESHOLD) {
      if (end < start) nextImage();
      else prevImage();
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeLightbox();
    },
    [lightboxOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const aiPricing = listing.aiPricing || null;

  // --------------------------------------------------
  // RENDERING
  // --------------------------------------------------

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/" className="text-blue-600 hover:underline">
        ← Back
      </Link>

      <div className="grid lg:grid-cols-3 gap-10 mt-6">

        {/* MAIN IMAGE + THUMBNAILS */}
        <div className="lg:col-span-2 space-y-4">

          <div
            className="h-72 md:h-96 rounded-xl overflow-hidden cursor-zoom-in"
            onClick={() => openLightbox(lightboxIndex)}
          >
            <img
              src={activeImage}
              className="w-full h-full object-cover"
              alt={listing.title}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => openLightbox(idx)}
                className={`h-16 w-24 rounded-lg overflow-hidden border ${
                  idx === lightboxIndex
                    ? "border-blue-500"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt={"thumbnail " + idx}
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - DETAILS */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <p className="text-gray-600">{listing.address}</p>

          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-2xl font-semibold text-blue-600">
              ${listing.price?.toLocaleString()}
            </p>
            <p className="text-green-600">
              ${listing.downPayment?.toLocaleString()} down
            </p>
          </div>

          {/* AI PRICING */}
          {aiPricing && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-slate-800">
              <p className="font-semibold">AI Pricing Insight</p>

              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <p className="text-xs text-slate-500">Suggested price</p>
                  <p className="font-semibold">
                    ${aiPricing.estimate?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Range</p>
                  <p>
                    ${aiPricing.low?.toLocaleString()} – $
                    {aiPricing.high?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Down payment</p>
                  <p>${aiPricing.downPayment?.toLocaleString()}</p>
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-600">
                {aiPricing.reasoning}
              </p>
            </div>
          )}

          {/* AI Full Description */}
          {listing.aiFullDescription && (
            <div className="bg-white shadow rounded-xl p-4 text-sm text-gray-700">
              <h3 className="font-semibold mb-2">Property overview (AI-generated)</h3>
              <p className="whitespace-pre-line">{listing.aiFullDescription}</p>
            </div>
          )}

          {/* Owner Notes */}
          {listing.description && (
            <div className="bg-white shadow rounded-xl p-4 text-sm text-gray-700">
              <h3 className="font-semibold mb-2">Owner notes</h3>
              <p className="whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          {/* AI Tags */}
          {listing.aiTags && listing.aiTags.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
              <h3 className="font-semibold">Smart highlights (AI tags)</h3>

              <div className="flex flex-wrap gap-1 mt-2">
                {listing.aiTags.slice(0, 12).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-white border border-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Caption */}
          {listing.aiCaption && (
            <div className="bg-white shadow rounded-xl p-4 text-sm text-gray-700">
              <h3 className="font-semibold mb-1">AI quick caption</h3>
              <p>{listing.aiCaption}</p>
            </div>
          )}
        </div>
      </div>

      {/* SIMILAR HOMES */}
      <SimilarHomes listingId={id} tags={listing.aiTags} price={listing.price} />

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP BAR */}
            <div className="flex justify-between mb-3 text-white text-sm">
              <p>
                {lightboxIndex + 1}/{images.length}
              </p>

              <button
                onClick={closeLightbox}
                className="px-3 py-1 border border-white/40 rounded-full"
              >
                ✕ Close
              </button>
            </div>

            {/* IMAGE */}
            <div
              className="bg-black rounded-lg overflow-hidden flex items-center justify-center max-h-[80vh]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => {
                handleTouchEnd();
                handleDoubleTap();
              }}
              onDoubleClick={handleDoubleTap}
            >
              <img
                src={activeImage}
                className="max-h-[80vh] max-w-full transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>

            {/* CONTROLS */}
            <div className="flex justify-between items-center mt-3 text-white text-sm">

              <div className="flex gap-2">
                <button
                  onClick={prevImage}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  ← Prev
                </button>
                <button
                  onClick={nextImage}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  Next →
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUniversalShare(activeImage)}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  🔗 Share
                </button>

                <a
                  href={activeImage}
                  download={`hi-awto-image-${lightboxIndex + 1}.jpg`}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  ⬇ Download
                </a>

                <button
                  onClick={() => handleSaveToPhotos(activeImage)}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  📱 Save
                </button>

                <button
                  onClick={() => handleCopyImage(activeImage)}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  📋 Copy
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={zoomOut}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  −
                </button>
                <span className="opacity-70">{(zoom * 100).toFixed(0)}%</span>
                <button
                  onClick={zoomIn}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  +
                </button>
                <button
                  onClick={resetZoom}
                  className="px-3 py-1 border border-white/40 rounded-full hover:bg-white/10"
                >
                  Reset
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
