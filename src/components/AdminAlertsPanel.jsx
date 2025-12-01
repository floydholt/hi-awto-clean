// src/components/AdminAlertsPanel.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function AdminAlertsPanel({ alerts, currentUid, onMarkRead }) {
  const items = alerts || [];

  const unreadCount = items.filter((a) =>
    currentUid ? !(a.readBy || []).includes(currentUid) : false
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Admin alerts</h2>
          <p className="text-xs text-slate-500">
            High-risk fraud events and moderation activity.
          </p>
        </div>
        <div className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400">No alerts yet.</p>
        ) : (
          items.map((a) => {
            const ts =
              (a.createdAt && a.createdAt.toDate && a.createdAt.toDate()) ||
              (a.createdAt && typeof a.createdAt === "number"
                ? new Date(a.createdAt)
                : null);

            const isUnread = currentUid
              ? !(a.readBy || []).includes(currentUid)
              : false;

            return (
              <div
                key={a.id}
                className={`border rounded-lg px-3 py-2 text-xs flex gap-3 ${
                  isUnread ? "bg-amber-50 border-amber-200" : "border-slate-100"
                }`}
              >
                <div className="text-lg flex-shrink-0 pt-0.5">
                  {a.type === "fraud_high" ? "🚨" : "📝"}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-800">
                      {a.title || "Alert"}
                    </div>
                    {ts && (
                      <div className="text-[10px] text-slate-400 whitespace-nowrap">
                        {ts.toLocaleDateString()}{" "}
                        {ts.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>

                  {a.message && (
                    <p className="mt-1 text-slate-600 line-clamp-2">
                      {a.message}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    {a.listingId && (
                      <Link
                        to={`/admin/fraud?listing=${a.listingId}`}
                        className="px-2 py-0.5 rounded-full border border-slate-300 text-[11px] hover:bg-slate-50"
                      >
                        View listing
                      </Link>
                    )}

                    {isUnread && currentUid && onMarkRead && (
                      <button
                        type="button"
                        onClick={() => onMarkRead(a.id)}
                        className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[11px] hover:bg-amber-700"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
