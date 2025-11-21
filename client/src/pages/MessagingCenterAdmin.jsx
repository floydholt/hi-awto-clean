// client/src/pages/MessagingCenterAdmin.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";

export default function MessagingCenterAdmin() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "threads"),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setThreads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Admin Messaging Center</h2>

      {threads.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No conversations yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {threads.map((t) => (
            <Link
              key={t.id}
              to={`/messages/${t.id}`}
              className="p-3 border rounded hover:bg-gray-50"
            >
              <div className="font-medium">{t.title || "Conversation"}</div>
              <div className="text-sm opacity-70">
                {t.lastMessagePreview || "Tap to open"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
