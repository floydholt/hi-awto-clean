import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../firebase/AuthContext";

export default function AdminUsers() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [queryText, setQueryText] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    let q = query(collection(db, "users"), orderBy("createdAt", "desc"));

    if (filter === "admins") {
      q = query(
        collection(db, "users"),
        where("role", "==", "admin"),
        orderBy("createdAt", "desc")
      );
    } else if (filter === "disabled") {
      q = query(
        collection(db, "users"),
        where("disabled", "==", true),
        orderBy("createdAt", "desc")
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [filter]);

  const filteredUsers = useMemo(() => {
    const q = queryText.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.email?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [users, queryText]);

  const formatDate = (ts) =>
    ts?.toDate
      ? ts.toDate().toLocaleDateString()
      : ts
      ? new Date(ts).toLocaleDateString()
      : "—";

  const promoteToAdmin = async (uid) => {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { role: "admin" });
  };

  const demoteToUser = async (uid) => {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { role: "user" });
  };

  const disableUser = async (uid) => {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { disabled: true });
  };

  const enableUser = async (uid) => {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { disabled: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">
            Manage user roles, permissions, and account access.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          ["all", "All Users"],
          ["admins", "Admins"],
          ["disabled", "Disabled"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              filter === key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by email, name, role, or UID..."
          className="w-full px-4 py-2 border rounded-lg"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
      </div>

      {/* User Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 text-left">Avatar</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Joined</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelected(u)}
                >
                  <td className="px-4 py-3">
                    <img
                      src={u.photoURL || "/placeholder-user.png"}
                      className="w-12 h-12 rounded-full object-cover"
                      alt=""
                    />
                  </td>
                  <td className="px-4 py-3">{u.displayName || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        u.role === "admin"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.disabled ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                        Disabled
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
                  <td
                    className="px-4 py-3 flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {u.role !== "admin" ? (
                      <button
                        onClick={() => promoteToAdmin(u.id)}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        Promote
                      </button>
                    ) : (
                      <button
                        onClick={() => demoteToUser(u.id)}
                        className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                      >
                        Demote
                      </button>
                    )}

                    {!u.disabled ? (
                      <button
                        onClick={() => disableUser(u.id)}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => enableUser(u.id)}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                      >
                        Enable
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <UserSidebar user={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function UserSidebar({ user, onClose }) {
  const formatDateTime = (ts) =>
    ts?.toDate
      ? ts.toDate().toLocaleString()
      : ts
      ? new Date(ts).toLocaleString()
      : "—";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Details</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <img
          src={user.photoURL || "/placeholder-user.png"}
          className="w-24 h-24 rounded-full object-cover mb-4"
          alt=""
        />

        <p className="text-xl font-bold">{user.displayName || "Unnamed"}</p>
        <p className="text-slate-600">{user.email}</p>

        <div className="mt-4">
          <h3 className="font-semibold text-slate-800">Role</h3>
          <p>{user.role || "user"}</p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-slate-800">Account Status</h3>
          {user.disabled ? (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
              Disabled
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
              Active
            </span>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-slate-800">Joined</h3>
          <p>{formatDateTime(user.createdAt)}</p>
        </div>

        <div className="mt-6 space-y-2">
          <a
            href={`/admin?user=${user.id}`}
            className="block px-3 py-2 bg-slate-100 text-slate-800 rounded border text-center"
          >
            Open Activity Feed →
          </a>
          <a
            href={`/admin/listings?owner=${user.id}`}
            className="block px-3 py-2 bg-blue-100 text-blue-800 rounded border text-center"
          >
            View User Listings →
          </a>
          <a
            href={`/messages?user=${user.id}`}
            className="block px-3 py-2 bg-purple-100 text-purple-700 rounded border text-center"
          >
            View User Messages →
          </a>
        </div>
      </div>
    </div>
  );
}
