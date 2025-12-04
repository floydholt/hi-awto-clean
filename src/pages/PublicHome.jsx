// src/pages/PublicHome.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function PublicHome() {
  return (
    <div className="bg-gray-50">

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto text-center px-6 py-20">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6">
          Lease-to-Own Homes, Made Simple.
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Browse flexible lease-to-own properties and take the next step
          toward owning your future home.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/search"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
          >
            Search Homes
          </Link>

          <Link
            to="/how-it-works"
            className="px-6 py-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            How It Works
          </Link>
        </div>
      </section>

      {/* MINI HOW-IT-WORKS SECTION */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 px-6 pb-16">
        <div className="p-6 bg-white shadow rounded-xl text-center">
          <h3 className="text-xl font-bold mb-2">1. Browse Homes</h3>
          <p className="text-slate-600 text-sm">
            Explore listings that qualify for lease-to-own programs.
          </p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl text-center">
          <h3 className="text-xl font-bold mb-2">2. Lease & Build Equity</h3>
          <p className="text-slate-600 text-sm">
            Live in the property while building ownership credits.
          </p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl text-center">
          <h3 className="text-xl font-bold mb-2">3. Buy When Ready</h3>
          <p className="text-slate-600 text-sm">
            Use your credits toward the purchase of your home.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-20">
        <Link
          to="/search"
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg shadow hover:bg-indigo-700"
        >
          Start Searching →
        </Link>
      </section>
    </div>
  );
}
