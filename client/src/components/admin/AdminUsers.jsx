import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", role: "user", password: "" });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      password: "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      loadUsers();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. Check console.");
    }
  };

  const saveUser = async () => {
    try {
      if (editing) {
        // Update existing user
        await updateDoc(doc(db, "users", editing.id), {
          name: form.name,
          email: form.email,
          role: form.role,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create auth user + Firestore user
        const authUser = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

        await addDoc(collection(db, "users"), {
          uid: authUser.user.uid,
          name: form.name,
          email: form.email,
          role: form.role,
          createdAt: serverTimestamp(),
        });
      }

      setShowModal(false);
      loadUsers();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed. Check console.");
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Create, edit, and manage user roles.</p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
        >
          + Add User
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading users…</p>}

      {/* User Table */}
      {!loading && users.length === 0 && (
        <p className="text-gray-500 italic">No users found.</p>
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 font-semibold text-sm">Name</th>
                <th className="p-3 font-semibold text-sm">Email</th>
                <th className="p-3 font-semibold text-sm">Role</th>
                <th className="p-3 font-semibold text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{u.name || "—"}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => openEdit(u)}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- Modal ---------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-4">
              {editing ? "Edit User" : "Create User"}
            </h3>

            {/* Form */}
            <div className="space-y-4">
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />

              {/* Role selector */}
              <select
                className="w-full border px-3 py-2 rounded"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="user">User</option>
              </select>

              {/* Password only required when creating */}
              {!editing && (
                <input
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              )}
            </div>

            {/* Save / Cancel */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveUser}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {editing ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
