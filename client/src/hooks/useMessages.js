// client/src/hooks/useMessages.js
import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase"; // adjust path if your firebase export is elsewhere

export default function useMessages({ uid, role } = {}) {
  // uid: current user id
  const [threads, setThreads] = useState([]);
  const threadsUnsubRef = useRef(null);

  useEffect(() => {
    if (!uid) {
      setThreads([]);
      if (threadsUnsubRef.current) threadsUnsubRef.current();
      return;
    }

    // listen to any thread where user is a participant (simple approach)
    const q = query(
      collection(db, "threads"),
      where("participants", "array-contains", uid),
      orderBy("lastMessageAt", "desc")
    );

    threadsUnsubRef.current = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setThreads(arr);
    });

    return () => {
      if (threadsUnsubRef.current) threadsUnsubRef.current();
    };
  }, [uid]);

  // subscribe to a single thread's messages
  function useThreadMessages(threadId) {
    const [messages, setMessages] = useState([]);
    useEffect(() => {
      if (!threadId) {
        setMessages([]);
        return;
      }
      const q = query(
        collection(db, "threads", threadId, "messages"),
        orderBy("createdAt", "asc")
      );
      const unsub = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
      return unsub;
    }, [threadId]);
    return messages;
  }

  // send message; creates thread if missing
  async function sendMessage({ threadId = null, listingId = null, to, text }) {
    if (!uid) throw new Error("Not authenticated");
    if (!text || text.trim() === "") return null;

    // create thread if needed
    let tid = threadId;
    if (!tid) {
      // minimal thread doc
      const threadRef = await addDoc(collection(db, "threads"), {
        listingId: listingId || null,
        buyerId: role === "buyer" ? uid : null,
        sellerId: role === "seller" ? uid : null,
        lastMessageText: text,
        lastMessageAt: serverTimestamp(),
        unreadFor: { buyer: role !== "buyer", seller: role !== "seller" },
        participants: [uid, to].filter(Boolean),
      });
      tid = threadRef.id;
    }

    // add message
    const messageRef = await addDoc(collection(db, "threads", tid, "messages"), {
      from: uid,
      to,
      text,
      createdAt: serverTimestamp(),
      read: false,
    });

    // update thread metadata
    const threadDocRef = doc(db, "threads", tid);
    await updateDoc(threadDocRef, {
      lastMessageText: text,
      lastMessageAt: serverTimestamp(),
      // set unread flags: mark other party unread
      [`unreadFor.${role === "buyer" ? "seller" : "buyer"}`]: true,
    });

    return { threadId: tid, messageId: messageRef.id };
  }

  // mark thread messages read for current user
  async function markThreadRead(threadId) {
    if (!uid) return;
    const threadRef = doc(db, "threads", threadId);
    // clear unread flag for this user's role (if role provided)
    if (role) {
      await updateDoc(threadRef, {
        [`unreadFor.${role}`]: false,
      });
    }
    // optionally mark existing messages read
    // (for simplicity we update last 100 to read)
    const q = query(
      collection(db, "threads", threadId, "messages"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const snap = await getDocsSafe(q);
    if (snap) {
      const batchPromises = snap.docs
        .filter((d) => d.data().to === uid && !d.data().read)
        .map((d) => updateDoc(doc(db, "threads", threadId, "messages", d.id), { read: true }));
      await Promise.allSettled(batchPromises);
    }
  }

  // helper because getDocs might not be imported elsewhere
  async function getDocsSafe(q) {
    try {
      const { getDocs } = await import("firebase/firestore");
      return await getDocs(q);
    } catch (e) {
      console.warn("getDocs import error:", e);
      return null;
    }
  }

  // admin helper to query threads with filters
  async function queryThreads({ buyerId, sellerId, listingId }) {
    let q = collection(db, "threads");
    const clauses = [];
    if (buyerId) clauses.push(where("buyerId", "==", buyerId));
    if (sellerId) clauses.push(where("sellerId", "==", sellerId));
    if (listingId) clauses.push(where("listingId", "==", listingId));
    if (clauses.length) {
      q = query(collection(db, "threads"), ...clauses, orderBy("lastMessageAt", "desc"));
    } else {
      q = query(collection(db, "threads"), orderBy("lastMessageAt", "desc"));
    }
    const snap = await (await import("firebase/firestore")).getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  return {
    threads,
    sendMessage,
    useThreadMessages,
    markThreadRead,
    queryThreads,
  };
}
