// client/src/pages/admin/MessagingCenterAdmin.jsx
import React, { useEffect, useState } from "react";
import { fetchInboxAdmin } from "../../api/messages";
import { Link } from "react-router-dom";

export default function MessagingCenterAdmin() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchInboxAdmin();
        setThreads(data);
      } catch (err) {
        console.error("Admin inbox error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="p-6">Loading admin messages…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Admin Messaging Center</h1>

      {threads.length === 0 ? (
        <div>No conversations found.</div>
      ) : (
        <div className="space-y-3">
          {threads.map((t) => (
            <Link
              to={`/admin/messages/${t.id}`}
              key={t.id}
              className="block p-4 bg-white rounded shadow hover:bg-gray-50"
            >
              <div className="font-semibold">
                {t.subject || "Conversation"}
              </div>
              <div className="text-sm text-gray-500">
                From: {t.userEmail || t.userId}
              </div>
              <div className="text-xs text-gray-400">
                {t.updatedAt
                  ? new Date(t.updatedAt.seconds * 1000).toLocaleString()
                  : ""}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
