import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllThreads } from "../firebase/messages.js";

export default function MessagingCenterAdmin() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getAllThreads();
      setThreads(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="page fade-in">
      <h1 className="page-title" style={{ textAlign: "center" }}>
        Admin Messaging Center
      </h1>

      {loading && <div>Loading threads...</div>}

      {!loading && threads.length === 0 && (
        <div className="card" style={{ textAlign: "center" }}>
          No message threads found.
        </div>
      )}

      {/* Thread List */}
      <div style={{ display: "grid", gap: "16px" }}>
        {threads.map((t) => (
          <Link
            to={`/thread/${t.id}`}
            key={t.id}
            className="card hover-glow"
            style={{
              padding: "16px",
              display: "block",
              textDecoration: "none",
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
              {t.participants?.join(", ") || "Users"}
            </div>

            <div
              style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                marginTop: "6px",
              }}
            >
              {t.lastMessage || "No messages yet"}
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "6px",
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
