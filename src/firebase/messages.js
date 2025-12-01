// src/firebase/messages.js
import { db } from "./index.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";



/* ---------------------------------------------------------
   THREADS
--------------------------------------------------------- */

export async function getThread(threadId) {
  const ref = doc(db, "threads", threadId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function streamThread(threadId, callback) {
  const ref = doc(db, "threads", threadId);

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return callback(null);
    callback({ id: snap.id, ...snap.data() });
  });
}

/* ---------------------------------------------------------
   MESSAGES
--------------------------------------------------------- */

export async function sendMessage(threadId, message) {
  const msg = {
    ...message,
    threadId,
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "messages"), msg);

  // update thread last message
  const threadRef = doc(db, "threads", threadId);
  await updateDoc(threadRef, {
    lastMessage: msg.text ?? "",
    lastUpdated: serverTimestamp(),
  });
}

export function streamMessages(threadId, callback) {
  const q = query(
    collection(db, "messages"),
    where("threadId", "==", threadId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/* ---------------------------------------------------------
   MESSAGE READ RECEIPTS
--------------------------------------------------------- */

export async function markThreadMessagesRead(threadId, userId) {
  const q = query(
    collection(db, "messages"),
    where("threadId", "==", threadId)
  );

  const snap = await getDocs(q);
  const batch = writeBatch(db);

  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const ref = doc(db, "messages", docSnap.id);

    const readBy = d.readBy ?? [];
    if (!readBy.includes(userId)) {
      batch.update(ref, { readBy: [...readBy, userId] });
    }
  });

  return batch.commit();
}

/* ---------------------------------------------------------
   ADMIN: GET ALL THREADS (legacy support)
--------------------------------------------------------- */

export async function getAllThreads() {
  const q = query(
    collection(db, "threads"),
    orderBy("lastUpdated", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}



export async function getUserThreads(userId) {
  const q = query(
    collection(db, "threads"),
    where("participantIds", "array-contains", userId),
    orderBy("lastUpdated", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
