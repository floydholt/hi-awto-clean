// src/components/StartConversationButton.jsx
import React, { useState } from "react";
import { createThread } from "../api/messages";
import { useNavigate } from "react-router-dom";

export default function StartConversationButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    const threadId = await createThread();
    navigate(`/messages?thread=${threadId}`);
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading ? "Creating..." : "Message Support"}
    </button>
  );
}
