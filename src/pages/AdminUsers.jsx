import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  promoteUser,
  demoteUser,
  suspendUser,
  unsuspendUser,
} from "../firebase/adminUsers.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin User Management</h1>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search users..."
        className="w-full mb-4 px-3 py-2 border rounded-lg"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="px-3 py-2">{u.displayName || "—"}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2 capitalize">
                    {u.role || "user"}
                  </td>
                  <td className="px-3 py-2">
                    {u.suspended ? (
                      <span className="text-red-600 font-semibold">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </td>
                  <td className="px-3 py-2 space-x-2">
                    {/* PROMOTE / DEMOTE */}
                    {u.role === "admin" ? (
                      <button
                        onClick={() => demoteUser(u.id).then(loadUsers)}
                        className="px-2 py-1 bg-amber-200 text-amber-900 rounded"
                      >
                        Demote
                      </button>
                    ) : (
                      <button
                        onClick={() => promoteUser(u.id).then(loadUsers)}
                        className="px-2 py-1 bg-blue-600 text-white rounded"
                      >
                        Promote
                      </button>
                    )}

                    {/* SUSPEND / UNSUSPEND */}
                    {u.suspended ? (
                      <button
                        onClick={() => unsuspendUser(u.id).then(loadUsers)}
                        className="px-2 py-1 bg-green-600 text-white rounded"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        onClick={() => suspendUser(u.id).then(loadUsers)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-slate-400 py-4"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
