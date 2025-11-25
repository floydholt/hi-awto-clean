import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserThreads } from "../firebase/messages.js";
import { useAuth } from "../firebase/AuthContext.jsx";

export default function MyMessages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getUserThreads(user.uid);
      setThreads(data);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="page fade-in">
      <h1 className="page-title" style={{ textAlign: "center" }}>
        My Messages
      </h1>

      {loading && <div>Loading conversations...</div>}

      {!loading && threads.length === 0 && (
        <div className="card" style={{ textAlign: "center" }}>
          You have no message threads yet.
        </div>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {threads.map((t) => (
          <Link
            to={`/thread/${t.id}`}
            key={t.id}
            className="card hover-glow"
            style={{
              padding: "16px",
              display: "block",
              color: "#111827",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--blue)",
              }}
            >
              {t.otherUser?.displayName || "Unknown User"}
            </div>
            <div
              style={{
                marginTop: "6px",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              {t.lastMessage || "No messages yet"}
            </div>
            <div
              style={{
                marginTop: "6px",
                fontSize: "0.75rem",
                color: "#9ca3af",
              }}
            >
              {new Date(t.updatedAt).toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
