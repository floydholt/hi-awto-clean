// client/src/utils/messageHelpers.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Lightweight helpers used by components above.
 */

export async function sendMessageToThread(threadId, { text, sender, replyTo = null }) {
  const messagesRef = collection(db, `threads/${threadId}/messages`);
  const m = {
    text,
    senderUid: sender.uid,
    senderName: sender.name || "",
    createdAt: serverTimestamp(),
    reactions: {},
    seen: { [sender.uid]: true },
    replyTo,
  };

  const docRef = await addDoc(messagesRef, m);

  // update thread summary
  const threadRef = doc(db, "threads", threadId);
  await updateDoc(threadRef, {
    lastMessage: {
      id: docRef.id,
      text: m.text,
      senderUid: m.senderUid,
      senderName: m.senderName,
      createdAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function setTypingStatus(threadId, uid, isTyping = false) {
  // store typing as separate small doc per uid
  const typingRef = doc(db, `threads/${threadId}/typing`, uid);
  if (isTyping) {
    await setDoc(typingRef, { typing: true, updatedAt: serverTimestamp() });
  } else {
    // remove doc when not typing (safer than update)
    try { await setDoc(typingRef, { typing: false, updatedAt: serverTimestamp() }); }
    catch (e) { /* ignore */ }
  }
}
