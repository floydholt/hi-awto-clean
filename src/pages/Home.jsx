// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadListings = async () => {
      try {
        const q = query(
          collection(db, "listings"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setListings(docs);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full bg-white pt-16 pb-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <img
            src="/logo512.png"
            alt="HI AWTO Logo"
            className="mx-auto mb-6 h-16 w-16 opacity-90"
          />

          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Here is another way to own
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
            Lease-to-Own Homes, Made Simple.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600">
            Browse flexible lease-to-own properties, compare options, and connect
            with the HI AWTO team to start your path to ownership.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/search"
              className="rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              Browse Listings
            </Link>

            <Link
              to="/register"
              className="rounded-full border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="mx-auto max-w-5xl px-4 pb-10">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Search
          </h2>

          <div className="mt-3 grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search by city, address, or keyword"
              className="col-span-2 rounded-lg border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-sky-400 focus:ring-sky-400"
            />
            <input
              type="number"
              placeholder="Min Price"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm shadow-sm"
            />
            <input
              type="number"
              placeholder="Max Price"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm shadow-sm"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              to="/search"
              className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Listings Pipeline",
              desc: "Track properties through intake, underwriting, and marketing.",
            },
            {
              title: "Lead Management",
              desc: "Capture and nurture tenant-buyers from every listing.",
            },
            {
              title: "Messaging Center",
              desc: "Centralize conversations between admins, agents, and buyers.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-xs text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Listings */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Available Lease-to-Own Listings
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500">Loading listings…</p>
        ) : listings.length === 0 ? (
          <p className="text-sm text-slate-500">
            No listings found. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-video overflow-hidden bg-slate-100">
                  {listing.imageUrls?.[0] ? (
                    <img
                      src={listing.imageUrls[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {listing.title || "Untitled Listing"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 truncate">
                    {listing.address || "Unknown address"}
                  </p>

                  {listing.price && (
                    <p className="mt-2 text-sm font-bold text-sky-600">
                      ${Number(listing.price).toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/search"
            className="rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            View All Listings
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} HI-AWTO. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
