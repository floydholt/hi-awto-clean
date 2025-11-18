// src/api/messages.js
import {
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  doc,
  collection,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

// -------------------------------------------------
// USER: Create a message thread
// -------------------------------------------------
export async function createThread() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const ref = await addDoc(collection(db, "messages"), {
    userId: user.uid,
    name: user.displayName || "User",
    lastMessage: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

// -------------------------------------------------
// USER: Send a message to admin
// -------------------------------------------------
export async function sendMessageUser(threadId, text) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  await addDoc(collection(db, `messages/${threadId}/thread`), {
    text,
    sender: "user",
    senderId: user.uid,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "messages", threadId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });
}

// -------------------------------------------------
// ADMIN: Send a message back to user
// -------------------------------------------------
export async function sendMessage(threadId, text) {
  await addDoc(collection(db, `messages/${threadId}/thread`), {
    text,
    sender: "admin",
    senderId: "admin",
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "messages", threadId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });
}

// -------------------------------------------------
// ADMIN: Fetch all message inboxes
// -------------------------------------------------
export async function fetchInbox() {
  const q = query(
    collection(db, "messages"),
    orderBy("updatedAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// -------------------------------------------------
// Fetch message thread
// -------------------------------------------------
export async function fetchThread(threadId) {
  const q = query(
    collection(db, `messages/${threadId}/thread`),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// -------------------------------------------------
// AI Draft (calls Cloud Function)
// -------------------------------------------------
export async function requestAIDraft(text) {
  const res = await fetch("/api/aidraft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const json = await res.json();
  return json.draft;
}
