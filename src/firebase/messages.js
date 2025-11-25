// src/firebase/messages.js
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";

const THREADS_COL = "threads";

// ---------------------------------------------
// Single thread by id
// ---------------------------------------------
export async function getThread(threadId) {
  if (!threadId) return null;
  const ref = doc(db, THREADS_COL, threadId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ---------------------------------------------
// Threads for a specific user (inbox)
// ---------------------------------------------
export async function getUserThreads(userId) {
  if (!userId) return [];
  const q = query(
    collection(db, THREADS_COL),
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------------------------------------------
// ALL threads (admin inbox)
// ---------------------------------------------
export async function getAllThreads() {
  const q = query(
    collection(db, THREADS_COL),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------------------------------------------
// Messages in a thread (non-realtime helper)
// ---------------------------------------------
export async function getThreadMessages(threadId) {
  if (!threadId) return [];
  const msgsRef = collection(db, `${THREADS_COL}/${threadId}/messages`);
  const q = query(msgsRef, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------------------------------------------
// Send a message in an existing thread
// message: { text, senderId, senderName, attachments?, readBy? }
// ---------------------------------------------
export async function sendMessage(threadId, message) {
  if (!threadId) throw new Error("threadId is required");

  const threadRef = doc(db, THREADS_COL, threadId);
  const msgsRef = collection(threadRef, "messages");
  const now = serverTimestamp();

  await addDoc(msgsRef, {
    ...message,
    pinned: message.pinned || false,
    createdAt: now,
    updatedAt: now,
  });

  await updateDoc(threadRef, {
    updatedAt: now,
    lastMessage: message.text || "[Attachment]",
    lastSenderId: message.senderId || null,
  });
}

// ---------------------------------------------
// Typing indicator
// ---------------------------------------------
export async function setThreadTyping(threadId, userId, isTyping) {
  if (!threadId || !userId) return;
  const threadRef = doc(db, THREADS_COL, threadId);

  await updateDoc(threadRef, {
    [`typing.${userId}`]: !!isTyping,
  });
}

// ---------------------------------------------
// Mark messages as read
// ---------------------------------------------
export async function markThreadMessagesRead(threadId, userId) {
  if (!threadId || !userId) return;

  const msgsRef = collection(db, `${THREADS_COL}/${threadId}/messages`);

  // Simple filter; adjust if needed based on your data
  const q = query(
    msgsRef,
    where("readBy", "not-in", [[userId]])
  );

  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);

  snap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const readBy = Array.isArray(data.readBy) ? data.readBy : [];
    if (!readBy.includes(userId)) {
      batch.update(docSnap.ref, {
        readBy: [...readBy, userId],
      });
    }
  });

  await batch.commit();
}

// ---------------------------------------------
// Pin / unpin a message
// ---------------------------------------------
export async function pinMessage(threadId, messageId, value) {
  if (!threadId || !messageId) return;

  const msgRef = doc(
    db,
    `${THREADS_COL}/${threadId}/messages/${messageId}`
  );

  await updateDoc(msgRef, {
    pinned: !!value,
    updatedAt: serverTimestamp(),
  });
}
