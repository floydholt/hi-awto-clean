import { useEffect, useState, useMemo, useRef } from "react";
import {
  collection,
  orderBy,
  limit,
  query,
  onSnapshot,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

const SEVERITY_COLORS = {
  info: "bg-blue-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  critical: "bg-purple-700",
};

const TYPE_ICONS = {
  LISTING_PROCESSING_STARTED: "⚙️",
  LISTING_PROCESSED: "✅",
  FRAUD_FLAG_HIGH: "🚨",
  AI_ERROR: "❌",
  BROCHURE_CREATED: "📄",
  BROCHURE_ERROR: "⚠️",
  ADMIN_PROMOTION: "⬆️",
  ADMIN_DEMOTION: "⬇️",
  LEAD_SUBMITTED: "💬",
  SYSTEM: "🛠️",
  default: "ℹ️",
};

const PAGE_SIZE = 50;

export default function ActivityFeed() {
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mutedTypes, setMutedTypes] = useState([]);
  const [toasts, setToasts] = useState([]);

  const firstLoadRef = useRef(true);
  const latestTimestampRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "adminLogs"),
      orderBy("timestamp", "desc"),
      limit(PAGE_SIZE)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs;
      const items = docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setLastDoc(docs[docs.length - 1] || null);
      setHasMore(docs.length === PAGE_SIZE);

      if (!firstLoadRef.current) {
        const newestTs = latestTimestampRef.current;
        const newItems = items.filter(
          (log) =>
            log.timestamp &&
            (newestTs === null || log.timestamp > newestTs)
        );

        newItems.forEach((log) => {
          const isCritical =
            log.severity === "error" ||
            log.severity === "critical" ||
            log.type?.includes("FRAUD");

          if (isCritical) {
            pushToast(log.message || "Critical event occurred");
          }
        });
      }

      if (items.length > 0) {
        latestTimestampRef.current = items[0].timestamp;
      }

      setLogs((prev) => {
        const map = new Map(prev.map((l) => [l.id, l]));
        items.forEach((l) => map.set(l.id, l));
        return Array.from(map.values()).sort(
          (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
        );
      });

      if (firstLoadRef.current) {
        firstLoadRef.current = false;
      }
    });

    return () => unsub();
  }, []);

  const pushToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      month: "short",
      day: "numeric",
    });

  const distinctTypes = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => l.type && set.add(l.type));
    return Array.from(set).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (mutedTypes.includes(log.type)) return false;

      const tabMatch =
        tab === "all" ||
        (tab === "listings" && log.listingId) ||
        (tab === "users" && log.userId) ||
        (tab === "fraud" && log.type?.includes("FRAUD")) ||
        (tab === "system" && log.type?.startsWith("SYSTEM"));

      if (!tabMatch) return false;

      const s = search.toLowerCase();
      return (
        !s ||
        log.message?.toLowerCase().includes(s) ||
        log.type?.toLowerCase().includes(s) ||
        log.listingId?.toLowerCase?.().includes(s) ||
        log.userId?.toLowerCase?.().includes(s)
      );
    });
  }, [logs, tab, search, mutedTypes]);

  const loadMore = async () => {
    if (!lastDoc || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const qMore = query(
        collection(db, "adminLogs"),
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );

      const snap = await getDocs(qMore);
      const docs = snap.docs;

      const items = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLogs((prev) => [...prev, ...items]);
      setLastDoc(docs[docs.length - 1] || null);
      setHasMore(docs.length === PAGE_SIZE);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const exportCsv = () => {
    if (!filteredLogs.length) {
      pushToast("No logs to export with current filters.");
      return;
    }

    const headers = [
      "id",
      "timestamp",
      "type",
      "severity",
      "message",
      "listingId",
      "userId",
    ];

    let csv = headers.join(",") + "\n";

    filteredLogs.forEach((log) => {
      const row = headers
        .map((h) => {
          let v = log[h] ?? "";

          if (h === "timestamp" && v) {
            v = new Date(v).toISOString();
          }

          const escaped = String(v).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",");

      csv += row + "\n";
    });

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-red-600 text-white px-4 py-2 rounded shadow flex items-center gap-3"
          >
            <span>⚠️</span>
            <span className="text-sm">{t.message}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="ml-2 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Activity Feed</h2>
          <button
            onClick={exportCsv}
            className="px-3 py-1 rounded border bg-gray-100 text-sm"
          >
            ⬇️ Export CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            ["all", "All"],
            ["listings", "Listings"],
            ["users", "Users"],
            ["fraud", "Fraud"],
            ["system", "System"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-3 py-1 rounded border text-sm ${
                tab === k
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search and mutes */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full px-3 py-2 border rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex-1 border rounded p-2 text-xs overflow-y-auto max-h-24">
            <div className="font-semibold mb-1">Mute event types:</div>
            <div className="flex flex-wrap gap-2">
              {distinctTypes.map((type) => (
                <label key={type} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={mutedTypes.includes(type)}
                    onChange={() =>
                      setMutedTypes((prev) =>
                        prev.includes(type)
                          ? prev.filter((t) => t !== type)
                          : [...prev, type]
                      )
                    }
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Log list */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start p-3 border rounded hover:bg-gray-50"
            >
              <div className="text-2xl mr-3">
                {TYPE_ICONS[log.type] || TYPE_ICONS.default}
              </div>

              <div className="flex-1">
                <div className="font-medium">{log.message}</div>

                <div className="text-sm text-gray-600 flex gap-3 mt-1">
                  {log.timestamp && <span>{formatTime(log.timestamp)}</span>}
                  {log.type && (
                    <span className="text-gray-500">Type: {log.type}</span>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  {log.listingId && (
                    <button
                      onClick={() =>
                        (window.location.href = `/admin/listings/${log.listingId}`)
                      }
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    >
                      Go to Listing →
                    </button>
                  )}

                  {log.userId && (
                    <button
                      onClick={() =>
                        (window.location.href = `/admin/users/${log.userId}`)
                      }
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
                    >
                      Go to User →
                    </button>
                  )}
                </div>

                {log.metadata && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-500">
                      View details
                    </summary>
                    <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>

              <div
                className={`ml-3 mt-1 w-3 h-3 rounded-full ${
                  SEVERITY_COLORS[log.severity] || "bg-gray-400"
                }`}
              ></div>
            </div>
          ))}

          {!filteredLogs.length && (
            <div className="text-center p-5 text-gray-500">
              No logs found.
            </div>
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
            >
              {isLoadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
