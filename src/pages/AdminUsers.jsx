// src/pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firestore.js";
import { useAuth } from "../firebase/AuthContext.jsx";


export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(200)
        );
        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchesRole =
      roleFilter === "all" ? true : (u.role || "user") === roleFilter;

    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (u.displayName || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.id || "").toLowerCase().includes(term);

    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Admin · Users
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage registered users, roles, and account status.
          </p>
        </div>

        <Link
          to="/admin"
          className="px-3 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Role:</span>
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1 rounded-full border text-xs ${
              roleFilter === "all"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setRoleFilter("admin")}
            className={`px-3 py-1 rounded-full border text-xs ${
              roleFilter === "admin"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setRoleFilter("user")}
            className={`px-3 py-1 rounded-full border text-xs ${
              roleFilter === "user"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Users
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or ID…"
            className="w-full md:w-64 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-slate-400 animate-pulse">
            Loading users…
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400">No users found.</p>
        ) : (
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2 pr-4">ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-50">
                  <td className="py-2 pr-4">
                    {u.displayName || "—"}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">
                    {u.email || "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        (u.role || "user") === "admin"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-500">
                    {u.createdAt?.toDate
                      ? u.createdAt.toDate().toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-2 pr-4 text-slate-400 max-w-[180px] truncate">
                    {u.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
