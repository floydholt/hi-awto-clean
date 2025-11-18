// client/src/components/MessageList.jsx
import React from "react";

export default function MessageList({ threads = [], onSelect, activeThreadId, currentUid }) {
  return (
    <div className="h-full overflow-auto">
      {threads.length === 0 && <div className="p-4 text-sm text-gray-600">No conversations yet.</div>}
      <div className="divide-y">
        {threads.map((t) => {
          const otherParticipant = (t.participants || []).find((p) => p !== currentUid);
          const unread = t.unreadFor && ((currentUid && t.unreadFor && (t.unreadFor.buyer && t.buyerId !== currentUid)) || (t.unreadFor.seller && t.sellerId !== currentUid));
          return (
            <div
              key={t.id}
              className={`p-3 cursor-pointer hover:bg-slate-50 ${t.id === activeThreadId ? "bg-slate-100" : ""}`}
              onClick={() => onSelect(t)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{t.listingTitle || `Listing ${t.listingId || ""}`}</div>
                  <div className="text-sm text-gray-600">{t.lastMessageText || "—"}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{t.lastMessageAt?.toDate ? new Date(t.lastMessageAt.toDate()).toLocaleTimeString() : ""}</div>
                  {unread && <div className="mt-1 inline-block px-2 py-0.5 text-xs rounded-full bg-red-600 text-white">New</div>}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{otherParticipant || "—"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
