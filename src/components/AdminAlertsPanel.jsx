import React, { useEffect, useState } from "react";
import { db } from "../firebase/firestore";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function AdminAlertsPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "admin_alerts"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      setAlerts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div className="p-4 bg-white border rounded-lg shadow">
      <h2 className="font-bold text-lg mb-3">Admin Alerts</h2>

      {alerts.length === 0 && (
        <p className="text-sm text-slate-500">No alerts</p>
      )}

      <div className="space-y-3">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="p-3 rounded border bg-slate-50 shadow-sm"
          >
            <div className="font-semibold">{a.title}</div>
            <div className="text-sm text-slate-600">{a.message}</div>
            {a.listingId && (
              <a
                href={`/listing/${a.listingId}`}
                className="text-blue-600 text-sm underline"
              >
                View Listing
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
