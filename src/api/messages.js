// client/src/api/messages.js
// Real-time messaging helpers (threads + messages + typing)

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const THREADS_COLLECTION = "threads"; // ← change here if your collection is named differently

/** Create a new thread (or return existing one) between participants */
export async function ensureThread({ threadId, participants, subject }) {
  if (threadId) {
    const ref = doc(db, THREADS_COLLECTION, threadId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  }

  const colRef = collection(db, THREADS_COLLECTION);
  const docRef = await addDoc(colRef, {
    participants,          // [uid...]
    subject: subject || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessageText: "",
    lastMessageAt: null,
    typing: {},           // { [uid]: true/false }
    unreadCounts: {},     // { [uid]: number }
    assignedTo: null,     // admin uid (optional)
  });

  const snap = await getDoc(docRef);
  return { id: docRef.id, ...snap.data() };
}

/** Listen to a single thread document in real-time */
export function listenToThread(threadId, callback) {
  const ref = doc(db, THREADS_COLLECTION, threadId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...snap.data() });
  });
}

/** Listen to messages for a thread in real-time */
export function listenToMessages(threadId, callback) {
  const colRef = collection(db, THREADS_COLLECTION, threadId, "messages");
  const q = query(colRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

/** Send a message in a thread */
export async function sendMessage({ threadId, text, senderId, senderName }) {
  if (!threadId || !text || !senderId) return;

  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const msgRef = collection(threadRef, "messages");

  await addDoc(msgRef, {
    text,
    senderId,
    senderName: senderName || "",
    createdAt: serverTimestamp(),
    seenBy: [senderId],
    deliveredTo: [],
    reactions: {},      // { "❤️": [ { uid, name }, ... ] }
  });

  await updateDoc(threadRef, {
    lastMessageText: text,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Set typing state for a given user on a thread */
export async function setTyping({ threadId, uid, isTyping }) {
  if (!threadId || !uid) return;
  const ref = doc(db, THREADS_COLLECTION, threadId);

  await updateDoc(ref, {
    [`typing.${uid}`]: !!isTyping,
    updatedAt: serverTimestamp(),
  });
}

/** Mark all messages in a thread as seen by a user */
export async function markThreadSeen({ threadId, uid }) {
  if (!threadId || !uid) return;

  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const unreadField = `unreadCounts.${uid}`;

  await updateDoc(threadRef, {
    [unreadField]: 0,
  });

  // In a more advanced version, you'd also update each message's seenBy,
  // probably with a batched write. For now, we just clear unreadCounts.
}

/** Update unreadCount for a user (used by admin / user inbox) */
export async function incrementUnread({ threadId, recipientUid }) {
  if (!threadId || !recipientUid) return;
  const threadRef = doc(db, THREADS_COLLECTION, threadId);

  const field = `unreadCounts.${recipientUid}`;
  await updateDoc(threadRef, {
    [field]: (await getDoc(threadRef)).data()?.unreadCounts?.[recipientUid] + 1 || 1,
  });
}
