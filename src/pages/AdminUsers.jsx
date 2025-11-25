// src/pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all"); // all | admins | banned
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(
        // if you add updatedAt later, you can orderBy("updatedAt", "desc")
        collection(db, "users")
      );

      let data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (filter === "admins") {
        data = data.filter((u) => u.role === "admin");
      } else if (filter === "banned") {
        data = data.filter((u) => u.banned === true);
      }

      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateUserLocally = (id, partial) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...partial } : u))
    );
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      updateUserLocally(id, { role: newRole });
    } catch (err) {
      console.error(err);
      alert("Failed to update user role.");
    }
  };

  const handleToggleBan = async (id, currentBanned) => {
    try {
      const next = !currentBanned;
      await updateDoc(doc(db, "users", id), { banned: next });
      updateUserLocally(id, { banned: next });
    } catch (err) {
      console.error(err);
      alert("Failed to update ban status.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Manage Users
          </h1>
          <p className="text-sm text-slate-500">
            View accounts, promote admins, and suspend problem users.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin"
            className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-sm"
          >
            ← Back to Dashboard
          </Link>
          <Link
            to="/admin/listings"
            className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-sm"
          >
            🏠 Manage Listings
          </Link>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 mb-5 text-sm">
        {[
          { id: "all", label: "All users" },
          { id: "admins", label: "Admins" },
          { id: "banned", label: "Banned" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full border ${
              filter === f.id
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-slate-500 mb-3">Loading users…</p>
      )}

      {/* USERS TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="py-2 px-3">User</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 w-52">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const initial =
                (u.displayName || u.email || "?")
                  .substring(0, 2)
                  .toUpperCase() || "?";

              return (
                <tr key={u.id} className="border-b last:border-none">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-semibold text-slate-600">
                        {u.photoURL ? (
                          <img
                            src={u.photoURL}
                            alt={u.displayName || u.email || u.id}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initial
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {u.displayName || "Unnamed user"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {u.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-700">
                    {u.email || (
                      <span className="text-xs text-slate-400">
                        (no email stored)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <select
                      value={u.role || "user"}
                      onChange={(e) =>
                        handleChangeRole(u.id, e.target.value)
                      }
                      className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="py-3 px-3">
                    {u.banned ? (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        Banned
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        Active
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleBan(u.id, u.banned)}
                        className={`px-2 py-1 text-xs rounded ${
                          u.banned
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {u.banned ? "Unban" : "Ban"}
                      </button>

                      {/* Future: impersonate, reset password, etc. */}
                      {/* <button className="px-2 py-1 text-xs rounded border border-slate-300 hover:bg-slate-100">
                        More
                      </button> */}
                    </div>
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-slate-500 text-sm"
                >
                  No users found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        Changes here update the Firestore <code>users</code> collection. Make
        sure your security rules only allow admins to perform these actions.
      </p>
    </div>
  );
}
