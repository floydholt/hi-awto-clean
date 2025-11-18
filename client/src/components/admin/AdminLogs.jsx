import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function load() {
      const q = query(
        collection(db, "logs"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">System Logs</h2>

      {logs.map((log) => (
        <div
          key={log.id}
          className="border p-3 mb-2 rounded bg-gray-50 shadow-sm"
        >
          <div className="text-sm text-gray-500">
            {log.createdAt?.toDate().toLocaleString()}
          </div>
          <div className="font-semibold">{log.type}</div>
          <div>{log.message}</div>

          {log.meta && (
            <pre className="text-xs mt-2 bg-gray-200 p-2 rounded">
              {JSON.stringify(log.meta, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
