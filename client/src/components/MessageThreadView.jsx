// src/components/MessageThreadView.jsx
import React, { useEffect, useState } from "react";
import MessageComposer from "./MessageComposer";
import { fetchThread, sendMessage } from "../api/messages";


export default function MessageThreadView({ threadId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!threadId) return;
    load();
  }, [threadId]);

  async function load() {
    const msgs = await fetchThread(threadId);
    setMessages(msgs);
  }

  if (!threadId)
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        Select a conversation
      </div>
    );

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-xl p-3 rounded ${
              m.sender === "admin"
                ? "bg-blue-100 ml-auto"
                : "bg-gray-200 mr-auto"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <MessageComposer
        threadId={threadId}
        onSent={() => load()}
        history={messages}
      />
    </div>
  );
}
