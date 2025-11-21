// client/src/components/MessageThreadView.jsx
import React, { useEffect, useState, useRef } from "react";
import { listenToThread, listenToMessages, markThreadSeen } from "../api/messages";
import { format } from "date-fns";

export default function MessageThreadView({
  threadId,
  currentUser, // { uid, displayName, role }
}) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // Subscribe to thread doc
  useEffect(() => {
    if (!threadId) return;
    const unsub = listenToThread(threadId, (data) => {
      setThread(data);
    });
    return () => unsub();
  }, [threadId]);

  // Subscribe to messages
  useEffect(() => {
    if (!threadId) return;
    const unsub = listenToMessages(threadId, (items) => {
      setMessages(items);
    });
    return () => unsub();
  }, [threadId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Mark as seen when viewing
  useEffect(() => {
    if (!threadId || !currentUser?.uid) return;
    markThreadSeen({ threadId, uid: currentUser.uid });
  }, [threadId, currentUser?.uid]);

  if (!threadId) {
    return (
      <div className="thread-view">
        <div className="empty">Select a conversation to view messages.</div>
      </div>
    );
  }

  const typingMap = thread?.typing || {};
  const typingUsers = Object.entries(typingMap)
    .filter(([uid, val]) => val && uid !== currentUser?.uid)
    .map(([uid]) => uid);

  const renderTimestamp = (ts) => {
    if (!ts?.toDate) return "";
    return format(ts.toDate(), "MMM d, h:mm a");
  };

  return (
    <div className="thread-view">
      {/* Messages */}
      <div className="messages-box">
        {messages.length === 0 && (
          <div className="empty">No messages yet. Start the conversation!</div>
        )}

        {messages.map((msg) => {
          const isCurrentUser = msg.senderId === currentUser?.uid;
          const rowClass = isCurrentUser ? "message-row user" : "message-row admin";
          const bubbleClass = isCurrentUser ? "message-bubble user" : "message-bubble admin";

          return (
            <div key={msg.id} className={rowClass}>
              <div className={bubbleClass}>
                {msg.text}
              </div>
              <div className={`message-time ${isCurrentUser ? "user" : "admin"}`}>
                {renderTimestamp(msg.createdAt)}
              </div>
              {/* simple meta stub for delivered/seen – can be expanded */}
              {isCurrentUser && (
                <div className="message-meta user">
                  <span className="delivery-status seen">Sent</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator (multi-agent) */}
        {typingUsers.length > 0 && (
          <div className="message-row admin">
            <div className="message-bubble admin typing-bubble">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
