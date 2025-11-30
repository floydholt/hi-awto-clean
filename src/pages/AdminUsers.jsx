// src/pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firestore.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load users once on mount
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const q = query(
          collection(db, "users"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsers(rows);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Failed to load users from Firestore.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!newRole) return;
    setError("");
    setSuccess("");
    setSavingId(userId);

    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: newRole,
              }
            : u
        )
      );
      setSuccess("User role updated (Cloud Function will sync auth claims).");
    } catch (err) {
      console.error("Failed to update user role:", err);
      setError("Failed to update user role. Check rules and try again.");
    } finally {
      setSavingId(null);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      const q = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setUsers(rows);
    } catch (err) {
      console.error("Failed to reload users:", err);
      setError("Failed to reload users.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Admin · Manage Users
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View all registered users and manage their roles.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin"
            className="px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={handleRefresh}
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            ⟳ Refresh
          </button>
        </div>
      </div>

      {/* STATUS MESSAGES */}
      {(error || success) && (
        <div className="space-y-2">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
              {success}
            </div>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              All Users
            </h2>
            <p className="text-xs text-slate-500">
              Only admins should have permission to access this page.
            </p>
          </div>
          {loading && (
            <span className="text-xs text-slate-400 animate-pulse">
              Loading…
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Current Role</th>
                <th className="py-2 px-4">Change Role</th>
                <th className="py-2 px-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 px-4 text-center text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}

              {users.map((u) => {
                const joined =
                  u.createdAt?.toDate?.() instanceof Date
                    ? u.createdAt.toDate().toLocaleDateString()
                    : "—";

                return (
                  <tr
                    key={u.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60"
                  >
                    <td className="py-2 px-4">
                      {u.displayName || "—"}
                    </td>
                    <td className="py-2 px-4 text-slate-600">
                      {u.email || "—"}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] ${
                          u.role === "admin"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-50 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <select
                        className="border border-slate-300 rounded-md text-xs px-2 py-1 bg-white"
                        value={u.role || "user"}
                        disabled={savingId === u.id}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value)
                        }
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-2 px-4 text-slate-500">
                      {joined}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-100">
          Changes here update the{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded">
            users
          </code>{" "}
          collection. A backend Cloud Function will keep Firebase Auth
          custom claims in sync with this role.
        </div>
      </div>
    </div>
  );
}
