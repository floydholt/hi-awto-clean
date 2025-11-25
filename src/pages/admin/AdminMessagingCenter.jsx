// client/src/pages/admin/AdminMessagingCenter.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import "../../styles/swipe.css";

export default function AdminMessagingCenter() {
  const [threads, setThreads] = useState([]);
  const [admins, setAdmins] = useState([]); // list of assignable admins
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState({});
  const [assignTarget, setAssignTarget] = useState(""); // UID of selected admin

  // ---------------------------
  // Load Threads (Realtime)
  // ---------------------------
  useEffect(() => {
    const q = query(collection(db, "threads"), orderBy("updatedAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setThreads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // ---------------------------
  // Load Admins from Firestore
  // ---------------------------
  useEffect(() => {
    const q = query(collection(db, "admins"));

    const unsub = onSnapshot(q, (snap) => {
      setAdmins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // ---------------------------
  // Selection Handling
  // ---------------------------
  function toggleSelected(id) {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  function selectAll() {
    const state = {};
    threads.forEach((t) => (state[t.id] = true));
    setSelected(state);
  }

  function deselectAll() {
    setSelected({});
  }

  // ---------------------------
  // Bulk Delete
  // ---------------------------
  async function deleteSelected() {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;

    if (!window.confirm(`Delete ${ids.length} selected conversations?`)) return;

    for (const id of ids) {
      await deleteDoc(doc(db, "threads", id));
    }

    setSelected({});
    setBulkMode(false);
  }

  // ---------------------------
  // Bulk Assign to Agent
  // ---------------------------
  async function assignSelected() {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0 || !assignTarget)
      return alert("Select at least one thread AND an agent");

    const targetAdmin = admins.find((a) => a.id === assignTarget);

    if (
      !window.confirm(
        `Assign ${ids.length} conversation(s) to ${targetAdmin?.name || "this agent"}?`
      )
    )
      return;

    for (const id of ids) {
      await updateDoc(doc(db, "threads", id), {
        assignedTo: assignTarget,
        assignedAt: new Date(),
      });
    }

    alert("Assigned successfully.");
    setSelected({});
    setAssignTarget("");
    setBulkMode(false);
  }

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Admin Messaging</h2>

        <button
          className={`px-3 py-1 rounded ${
            bulkMode ? "bg-gray-500 text-white" : "bg-indigo-600 text-white"
          }`}
          onClick={() => {
            setBulkMode((v) => !v);
            setSelected({});
            setAssignTarget("");
          }}
        >
          {bulkMode ? "Cancel" : "Bulk Select"}
        </button>
      </div>

      {/* Bulk Mode Tools */}
      {bulkMode && (
        <div className="mb-3 space-y-3">
          <div className="flex justify-between">
            <button className="text-sm underline text-indigo-600" onClick={selectAll}>
              Select All
            </button>
            <button className="text-sm underline text-gray-600" onClick={deselectAll}>
              Deselect All
            </button>
          </div>

          {/* Assign to agent */}
          <div className="flex items-center gap-2">
            <select
              className="border p-2 rounded flex-1"
              value={assignTarget}
              onChange={(e) => setAssignTarget(e.target.value)}
            >
              <option value="">Assign to agent...</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name || a.email}
                </option>
              ))}
            </select>

            <button
              className="bg-green-600 text-white px-3 py-2 rounded"
              onClick={assignSelected}
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {/* Threads */}
      {threads.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No conversations</p>
      ) : (
        <div className="flex flex-col gap-2 thread-list">
          {threads.map((t) => {
            const unread = t.unreadCount?.admin || 0;
            const checked = selected[t.id] || false;

            return (
              <div key={t.id} className="flex items-center gap-2">
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelected(t.id)}
                    className="h-5 w-5 accent-indigo-600"
                  />
                )}

                <Link
                  to={`/admin/messages/${t.id}`}
                  className={`flex-1 bg-white p-3 border rounded flex justify-between items-center ${
                    bulkMode ? "pointer-events-none opacity-70" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {t.title || t.displayName || "Conversation"}
                    </span>

                    {t.assignedTo && (
                      <span className="text-xs text-green-700">
                        Assigned to: {admins.find((a) => a.id === t.assignedTo)?.name}
                      </span>
                    )}

                    <span className="text-sm opacity-70">{t.lastMessagePreview}</span>
                  </div>

                  {unread > 0 && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                      {unread}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Action Footer */}
      {bulkMode && selectedCount > 0 && (
        <div className="bulk-delete-bar">
          <span>{selectedCount} selected</span>

          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={deleteSelected}
          >
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
}
