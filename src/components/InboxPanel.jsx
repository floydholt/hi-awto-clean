// src/components/InboxPanel.jsx
import React from "react";

export default function InboxPanel({ inbox, onSelect }) {
  return (
    <div className="w-1/3 border-r overflow-y-auto p-4 bg-gray-50">
      <h2 className="font-semibold text-lg mb-3">Inbox</h2>

      {inbox.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        inbox.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className="p-3 mb-2 border rounded cursor-pointer bg-white hover:bg-gray-100"
          >
            <div className="font-semibold">{conv.name || "Lead"}</div>
            <div className="text-sm text-gray-600 line-clamp-1">
              {conv.lastMessage}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
