import React, { useEffect, useState } from "react";
import {
  createThread,
  fetchThread,
  sendMessageUser,
} from "../api/messages";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function MyMessages() {
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // Create or fetch existing personal thread
      const t = await createThread();
      setThreadId(t);

      const msgs = await fetchThread(t);
      setMessages(msgs);
    });

    return () => unsub();
  }, []);

  async function handleSend() {
    if (!text.trim()) return;

    await sendMessageUser(threadId, text);

    const msgs = await fetchThread(threadId);
    setMessages(msgs);

    setText("");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Messages</h1>

      <div className="border rounded p-4 bg-white shadow">
        <div className="h-80 overflow-y-auto border p-3 mb-3 bg-gray-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-2 rounded mb-2 ${
                m.sender === "user"
                  ? "bg-blue-200 ml-auto text-right"
                  : "bg-gray-300 mr-auto"
              }`}
              style={{ maxWidth: "70%" }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
