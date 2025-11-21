// client/src/pages/MessagingCenter.jsx
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { fetchInbox } from "../api/messages";
import { Link } from "react-router-dom";

export default function MessagingCenter() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) return;

      const data = await fetchInbox(user.uid);
      setThreads(data);
    }
    load();
  }, []);

  return (
    <div className="messaging-center">
      <h2>My Messages</h2>

      {threads.map((t) => (
        <Link key={t.id} to={`/messages/${t.id}`} className="thread-item">
          <div>
            <div className="address">{t.listingId}</div>
            <div className="date">
              {t.createdAt?.toDate().toLocaleString?.() ?? ""}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
