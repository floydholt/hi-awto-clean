// src/components/MessageComposer.jsx
import React, { useState } from "react";
import { sendMessage, sendMessageUser, requestAIDraft } from "../api/messages";


export default function MessageComposer({ threadId, onSent, history }) {
  const [text, setText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  async function send() {
    if (!text.trim()) return;
    await sendMessage(threadId, text.trim());
    setText("");
    onSent();
  }

  async function draftAI() {
    setLoadingAI(true);
    const draft = await requestAIDraft(history);
    setText(draft);
    setLoadingAI(false);
  }

  return (
    <div className="border-t p-4 flex gap-3 items-center bg-white">
      <button
        onClick={draftAI}
        disabled={loadingAI}
        className="px-3 py-2 bg-purple-600 text-white rounded"
      >
        {loadingAI ? "Thinking..." : "AI Draft"}
      </button>

      <input
        className="flex-1 border p-2 rounded"
        value={text}
        placeholder="Type a message..."
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={send}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Send
      </button>
    </div>
  );
}
