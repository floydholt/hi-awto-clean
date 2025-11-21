// client/src/components/MessageComposer.jsx
import React, { useState, useEffect, useRef } from "react";
import { sendMessage, setTyping } from "../api/messages";

const TYPING_DEBOUNCE_MS = 400;
const STOP_TYPING_DELAY_MS = 2500;

export default function MessageComposer({
  threadId,
  currentUser, // { uid, displayName, role }
}) {
  const [text, setText] = useState("");
  const [isTyping, setIsTypingLocal] = useState(false);
  const typingTimeoutRef = useRef(null);
  const lastSentRef = useRef(0);

  // Helper to send typing state to Firestore
  const pushTypingState = async (typing) => {
    if (!threadId || !currentUser?.uid) return;
    try {
      await setTyping({
        threadId,
        uid: currentUser.uid,
        isTyping: typing,
      });
    } catch (err) {
      console.error("setTyping error", err);
    }
  };

  // When the input changes, mark as typing (debounced)
  useEffect(() => {
    if (!threadId || !currentUser?.uid) return;

    if (text && !isTyping) {
      setIsTypingLocal(true);
      pushTypingState(true);
    }

    // debounce: if user keeps typing, delay the "stop typing"
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTypingLocal(false);
        pushTypingState(false);
      }, STOP_TYPING_DELAY_MS);
    } else {
      // no text -> immediately stop typing
      setIsTypingLocal(false);
      pushTypingState(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, threadId, currentUser?.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !threadId || !currentUser?.uid) return;

    try {
      await sendMessage({
        threadId,
        text: trimmed,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "",
      });

      setText("");
      setIsTypingLocal(false);
      pushTypingState(false);
    } catch (err) {
      console.error("sendMessage failed", err);
      alert("Message failed to send. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="composer compose-wrapper">
      <input
        type="text"
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Message"
      />
      <button type="submit" disabled={!text.trim()}>
        Send
      </button>
    </form>
  );
}
