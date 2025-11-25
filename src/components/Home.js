import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllListings } from "../firebase/listings.js";

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllListings();
        setListings(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="home-wrapper fade-in">
      
      {/* HERO */}
      <div className="hero-container">
        <img src="/logo.png" alt="HI AWTO Logo" className="hero-logo-large" />
        <h1 className="hero-title-big">HI AWTO</h1>
        <p className="hero-tagline-big">HOMEOWNERSHIP IS POSSIBLE FOR EVERYONE</p>
      </div>

      <h2 className="section-title">Available Lease-to-Own Listings</h2>

      {loading && <div className="loading-text">Loading listings...</div>}

      {!loading && listings.length === 0 && (
        <div className="empty-text">No listings yet. Check back soon.</div>
      )}

      <div className="listings-grid">
        {listings.map((l) => (
          <Link key={l.id} to={`/listing/${l.id}`} className="listing-card hover-glow">
            <h3 className="listing-title">{l.title || "Untitled listing"}</h3>
            <p className="listing-address">{l.address}</p>
            <p className="listing-price">
              ${l.price?.toLocaleString?.() || l.price} total • $
              {l.downPayment?.toLocaleString?.() || l.downPayment} down
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
