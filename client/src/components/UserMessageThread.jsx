// src/components/UserMessageThread.jsx
import React, { useEffect, useState } from "react";
import { fetchThread, sendMessageUser } from "../api/messages";

export default function UserMessageThread({ threadId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!threadId) return;
    load();
  }, [threadId]);

  async function load() {
    const data = await fetchThread(threadId);
    setMessages(data);
  }

  if (!threadId)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a conversation
      </div>
    );

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-xl p-3 rounded ${
              m.sender === "admin"
                ? "bg-blue-100 mr-auto"
                : "bg-green-100 ml-auto"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <UserMessageComposer threadId={threadId} onSent={() => load()} />
    </div>
  );
}

function UserMessageComposer({ threadId, onSent }) {
  const [text, setText] = useState("");

  async function send() {
    if (!text.trim()) return;
    await sendMessageUser(threadId, text);
    setText("");
    onSent();
  }

  return (
    <div className="border-t p-4 flex gap-3 items-center bg-white">
      <input
        className="flex-1 border p-2 rounded"
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={send}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Send
      </button>
    </div>
  );
}
