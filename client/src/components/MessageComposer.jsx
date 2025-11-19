// client/src/components/MessageComposer.jsx
import React, { useState, useEffect, useRef } from "react";
import { sendMessage } from "../api/messages";
import debounce from "lodash.debounce";

/**
 * Props:
 * - threadId
 * - currentUser: { uid, displayName }
 * - replyingTo (object | null) - { id, text, senderId, senderName }
 * - onCancelReply - fn to clear reply state in parent
 * - onSent - optional callback when message sent
 * - setTypingStatus(threadId, uid, isTyping) optional function for typing presence
 */
export default function MessageComposer({
  threadId,
  currentUser,
  replyingTo = null,
  onCancelReply = () => {},
  onSent = () => {},
  setTypingStatus = null,
}) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  // debounce typing updates so we don't spam presence writes
  const sendTyping = useRef(
    debounce((isTyping) => {
      if (setTypingStatus && threadId && currentUser?.uid) {
        setTypingStatus(threadId, currentUser.uid, isTyping);
      }
    }, 400)
  ).current;

  useEffect(() => {
    return () => {
      // clear typing state if unmount
      sendTyping.cancel();
      sendTyping(false);
    };
  }, [sendTyping]);

  const handleChange = (e) => {
    setText(e.target.value);
    // indicate typing
    sendTyping(true);
    // schedule stop typing after pause
    debouncedStopTyping();
  };

  const debouncedStopTyping = debounce(() => {
    sendTyping(false);
  }, 1200);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      await sendMessage(threadId, {
        text: trimmed,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || null,
        replyTo: replyingTo || undefined,
      });
      setText("");
      // clear reply state
      onCancelReply();
      onSent();
      // clear typing
      sendTyping(false);
      debouncedStopTyping.cancel();
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Send failed — check console.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="message-composer p-3 border-t bg-white">
      {replyingTo && (
        <div className="reply-preview mb-2 p-2 bg-gray-50 rounded border">
          <div className="text-xs text-gray-500">Replying to {replyingTo.senderName || "Unknown"}</div>
          <div className="text-sm text-gray-700 line-clamp-2">{replyingTo.text}</div>
          <button
            onClick={() => {
              onCancelReply();
            }}
            className="text-xs text-red-500 mt-1"
            aria-label="Cancel reply"
          >
            Cancel
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          className="flex-1 p-2 border rounded resize-none"
          placeholder="Write a message..."
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <button
          type="button"
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => {
            // quick attach last message text as a reply if there's none selected
            if (!replyingTo && text.trim() === "") {
              inputRef.current.focus();
              return;
            }
            handleSubmit();
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
