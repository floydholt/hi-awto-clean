// client/src/components/MessageThreadView.jsx
import React, { useEffect, useRef, useState } from "react";
import { subscribeToThreadMessages } from "../api/messages";
import MessageComposer from "./MessageComposer";
import "../styles/messages.css";

/**
 * Props:
 * - threadId
 * - currentUser { uid, displayName }
 * - optional setTypingStatus(threadId, uid, isTyping)
 */
export default function MessageThreadView({ threadId, currentUser, setTypingStatus }) {
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const containerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchCandidateMsg = useRef(null);

  useEffect(() => {
    if (!threadId) return;
    const unsub = subscribeToThreadMessages(threadId, (items) => {
      setMessages(items);
      // scroll to bottom on new message
      setTimeout(() => {
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
      }, 40);
    });
    return () => unsub();
  }, [threadId]);

  // Swipe handlers for mobile: swipe right to reply
  const handleTouchStart = (e, msg) => {
    touchStartX.current = e.touches?.[0]?.clientX || null;
    touchCandidateMsg.current = msg;
  };

  const handleTouchEnd = (e, msg) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches?.[0]?.clientX || null;
    if (endX == null) return;
    const delta = endX - touchStartX.current;
    // threshold
    if (delta > 60) {
      triggerReply(msg);
    }
    touchStartX.current = null;
    touchCandidateMsg.current = null;
  };

  // Desktop: enable reply button / context menu
  const triggerReply = (msg) => {
    setReplyingTo({
      id: msg.id,
      text: msg.text,
      senderId: msg.senderId,
      senderName: msg.senderName,
    });
    // focus composer after small delay
    setTimeout(() => {
      const el = document.querySelector(".message-composer textarea");
      if (el) el.focus();
    }, 80);
  };

  return (
    <div className="message-thread h-full flex flex-col">
      <div ref={containerRef} className="message-list flex-1 overflow-auto p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`message-item ${m.senderId === currentUser?.uid ? "me" : "them"}`}
            onTouchStart={(e) => handleTouchStart(e, m)}
            onTouchEnd={(e) => handleTouchEnd(e, m)}
            // desktop fallback: double-click or right-click to reply
            onDoubleClick={() => triggerReply(m)}
          >
            {/* avatar + sender */}
            <div className="meta">
              <div className="sender">{m.senderName || "User"}</div>
              <div className="time">{m.createdAt?.toDate ? new Date(m.createdAt.toDate()).toLocaleTimeString() : ""}</div>
            </div>

            {/* replyTo quoted block */}
            {m.replyTo && (
              <div className="reply-quote" title={`In reply to ${m.replyTo.senderName || "Unknown"}`}>
                <div className="reply-meta text-xs text-gray-500">
                  Reply to {m.replyTo.senderName || "Unknown"}
                </div>
                <div className="reply-text text-sm text-gray-700 line-clamp-2">
                  {m.replyTo.text}
                </div>
              </div>
            )}

            {/* message text */}
            <div className="text">{m.text}</div>

            {/* small actions: reply button */}
            <div className="msg-actions">
              <button className="action-btn" onClick={() => triggerReply(m)} aria-label="Reply">
                Reply
              </button>
            </div>
          </div>
        ))}

        {messages.length === 0 && <div className="text-center text-gray-400 mt-8">No messages yet.</div>}
      </div>

      <MessageComposer
        threadId={threadId}
        currentUser={currentUser}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        setTypingStatus={setTypingStatus}
      />
    </div>
  );
}
