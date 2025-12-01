// src/pages/ViewThread.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/index.js";
import { useAuth } from "../firebase/AuthContext";

export default function ViewThread() {
  const { id: threadId } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Auto-scroll to the bottom
  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Load messages
  useEffect(() => {
    if (!threadId) return;

    const q = query(
      collection(db, "messages"),
      where("threadId", "==", threadId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(data);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsub();
  }, [threadId, scrollToBottom]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "messages"), {
      threadId,
      senderId: user.uid,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });

    setText("");
    scrollToBottom();
  };

  // Image/file sharing handler
  const shareImage = async (file) => {
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Shared Image",
          text: "Check out this image!",
          files: [file],
        });
      } else {
        // Fallback: copy URL
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const renderMessage = (msg) => {
    const mine = msg.senderId === user.uid;

    return (
      <div
        key={msg.id}
        className={`flex mb-3 ${mine ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`px-4 py-2 rounded-xl max-w-xs whitespace-pre-wrap ${
            mine ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {msg.text}

          {/* If message contains an imageUrl field */}
          {msg.imageUrl && (
            <img
              src={msg.imageUrl}
              alt=""
              className="mt-2 rounded cursor-pointer"
              onClick={() => openImage(msg.imageUrl)}
            />
          )}
        </div>
      </div>
    );
  };

  const openImage = (url) => {
    const fileName = url.substring(url.lastIndexOf("/") + 1);
    fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], fileName, { type: blob.type });
        shareImage(file);
      });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Message Thread</h1>

      {/* MESSAGES */}
      <div className="bg-white rounded-xl shadow border h-[65vh] p-4 overflow-y-auto">
        {loading ? (
          <p className="text-slate-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-slate-500">No messages yet.</p>
        ) : (
          messages.map((msg) => renderMessage(msg))
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT BOX */}
      <div className="mt-4 flex gap-3">
        <input
          type="text"
          className="flex-1 border rounded-lg px-4 py-2"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
