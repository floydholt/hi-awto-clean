// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config.js";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalListings: 0,
    featuredListings: 0,
    totalUsers: 0,
    totalThreads: 0,
  });

  const [recentListings, setRecentListings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        // --- LISTINGS COUNT ---
        const listingsSnap = await getDocs(collection(db, "listings"));
        let featuredCount = 0;
        listingsSnap.forEach((doc) => {
          const data = doc.data();
          if (data?.featured) featuredCount += 1;
        });

        // --- USERS COUNT + RECENT USERS ---
        let usersCount = 0;
        let usersList: any[] = [];
        try {
          const usersSnap = await getDocs(collection(db, "users"));
          usersCount = usersSnap.size;

          const recentUsersQuery = query(
            collection(db, "users"),
            orderBy("updatedAt", "desc"),
            limit(5)
          );
          const recentUsersSnap = await getDocs(recentUsersQuery);
          usersList = recentUsersSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
        } catch (err) {
          console.warn("Users collection may not exist yet:", err);
        }

        // --- THREADS COUNT ---
        let threadsCount = 0;
        try {
          const threadsSnap = await getDocs(collection(db, "threads"));
          threadsCount = threadsSnap.size;
        } catch (err) {
          console.warn("Threads collection may not exist yet:", err);
        }

        // --- RECENT LISTINGS ---
        let recentListingsData = [];
        try {
          const recentListingsQuery = query(
            collection(db, "listings"),
            orderBy("createdAt", "desc"),
            limit(5)
          );
          const recentListingsSnap = await getDocs(recentListingsQuery);
          recentListingsData = recentListingsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
        } catch (err) {
          console.warn(
            "createdAt index might be missing; falling back to default listings."
          );
          recentListingsData = listingsSnap.docs
            .slice(0, 5)
            .map((d) => ({ id: d.id, ...d.data() }));
        }

        setStats({
          totalListings: listingsSnap.size,
          featuredListings: featuredCount,
          totalUsers: usersCount,
          totalThreads: threadsCount,
        });
        setRecentListings(recentListingsData);
        setRecentUsers(usersList);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            High-level view of listings, users, and messaging across HI AWTO.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/messages"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-blue-600 text-white text-xs md:text-sm font-semibold hover:bg-blue-700"
          >
            💬 Admin Messaging
          </Link>
          <Link
            to="/admin/listings"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-slate-200 text-xs md:text-sm text-slate-700 hover:bg-slate-50"
          >
            🏠 Manage Listings
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-slate-200 text-xs md:text-sm text-slate-700 hover:bg-slate-50"
          >
            👤 Manage Users
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Listings"
          value={stats.totalListings}
          pill="Inventory"
        />
        <StatCard
          label="Featured Listings"
          value={stats.featuredListings}
          pill="Boosted"
          pillColor="bg-yellow-100 text-yellow-800"
        />
        <StatCard
          label="Registered Users"
          value={stats.totalUsers}
          pill="Accounts"
        />
        <StatCard
          label="Message Threads"
          value={stats.totalThreads}
          pill="Conversations"
        />
      </div>

      {loading && (
        <p className="text-sm text-slate-500 mb-4">Loading dashboard data…</p>
      )}

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* RECENT LISTINGS */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Listings
            </h2>
            <Link
              to="/admin/listings"
              className="text-xs text-blue-600 hover:underline"
            >
              Manage listings
            </Link>
          </div>

          {recentListings.length === 0 && (
            <p className="text-xs text-slate-500">
              No listings found yet. Once agents start adding properties, they
              will appear here.
            </p>
          )}

          {recentListings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Home</th>
                    <th className="py-2 pr-3">Price</th>
                    <th className="py-2 pr-3">Featured</th>
                    <th className="py-2 pr-3">AI Pricing</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((l) => {
                    const price =
                      l.price?.toLocaleString?.() || l.price || "—";
                    const aiPrice =
                      l.aiPricing?.estimate?.toLocaleString?.() ||
                      l.aiPricing?.estimate ||
                      null;

                    return (
                      <tr
                        key={l.id}
                        className="border-b last:border-b-0 hover:bg-slate-50/80"
                      >
                        <td className="py-2 pr-3">
                          <div className="font-medium text-slate-900 truncate max-w-[180px]">
                            {l.title || "Untitled listing"}
                          </div>
                          {l.aiTags && Array.isArray(l.aiTags) && (
                            <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                              AI: {l.aiTags.slice(0, 3).join(", ")}
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-slate-700">
                          ${price}
                        </td>
                        <td className="py-2 pr-3">
                          {l.featured ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-semibold">
                              Featured
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          {aiPrice ? (
                            <span className="text-[11px] text-blue-700">
                              ${aiPrice}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              No AI price
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <Link
                            to={`/listing/${l.id}`}
                            className="inline-flex items-center px-2 py-1 rounded-full border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-100"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT USERS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Users
            </h2>
            <Link
              to="/admin/users"
              className="text-xs text-blue-600 hover:underline"
            >
              Manage users
            </Link>
          </div>

          {recentUsers.length === 0 && (
            <p className="text-xs text-slate-500">
              No user profiles found yet.
            </p>
          )}

          {recentUsers.length > 0 && (
            <ul className="space-y-3 text-xs">
              {recentUsers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-medium text-slate-600">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.displayName || u.email || u.id}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (u.displayName || u.email || "?")
                          .substring(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {u.displayName || "Unnamed user"}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                        {u.email || "No email stored"}
                      </div>
                    </div>
                  </div>

                  {u.role && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-8 text-[11px] text-slate-400">
        Admin view only. Data is read-only here; moderation and edits live in
        the dedicated admin tools.
      </p>
    </div>
  );
}

function StatCard({ label, value, pill, pillColor }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">{label}</p>
        {pill && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              pillColor || "bg-slate-100 text-slate-600"
            }`}
          >
            {pill}
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-slate-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
