// src/firebase/adminAnalytics.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

import { db } from "./firestore.js";

/* -----------------------------------------------------------
   REAL-TIME LISTING COUNTS
----------------------------------------------------------- */
export function listenToListingCounts(callback) {
  return onSnapshot(collection(db, "listings"), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const approved = all.filter((l) => l.status === "approved").length;
    const pending = all.filter((l) => l.status === "pending").length;
    const rejected = all.filter((l) => l.status === "rejected").length;

    const recentListings = all
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 10);

    callback({
      total: all.length,
      approved,
      pending,
      rejected,
      recentListings,
    });
  });
}

/* -----------------------------------------------------------
   REAL-TIME USER COUNTS
----------------------------------------------------------- */
export function listenToUserCounts(callback) {
  return onSnapshot(collection(db, "users"), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const admins = all.filter((u) => u.role === "admin").length;

    const recentUsers =
      all
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 10) ?? [];

    callback({
      total: all.length,
      admins,
      recentUsers,
    });
  });
}

/* -----------------------------------------------------------
   REAL-TIME THREAD COUNTS
----------------------------------------------------------- */
export function listenToThreadCounts(callback) {
  return onSnapshot(collection(db, "threads"), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const activeLast7d = all.filter((t) => {
      const ts = t.updatedAt?.seconds;
      if (!ts) return false;
      return Date.now() / 1000 - ts < 7 * 24 * 3600;
    }).length;

    callback({
      totalThreads: all.length,
      activeLast7d,
    });
  });
}

/* -----------------------------------------------------------
   TIME-SERIES: NEW LISTINGS TREND
----------------------------------------------------------- */
export async function loadListingsTimeSeries(days = 7) {
  const since = Date.now() - days * 24 * 3600 * 1000;

  const qRef = query(
    collection(db, "listings"),
    where("createdAt", ">=", new Date(since)),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(qRef);
  const points = {};

  snap.forEach((doc) => {
    const d = doc.data();
    const dayKey = new Date(d.createdAt.toDate()).toLocaleDateString();
    points[dayKey] = (points[dayKey] || 0) + 1;
  });

  return Object.keys(points).map((label) => ({
    label,
    count: points[label],
  }));
}

/* -----------------------------------------------------------
   TIME-SERIES: FRAUD RISK TREND
   (🔥 YOU WERE MISSING THIS)
----------------------------------------------------------- */
export async function loadFraudTrendSeries(days = 7) {
  const since = Date.now() - days * 24 * 3600 * 1000;

  const qRef = query(
    collection(db, "fraudEvents"),
    where("timestamp", ">=", since),
    orderBy("timestamp", "asc")
  );

  const snap = await getDocs(qRef);

  return snap.docs.map((d) => ({
    timestamp: d.data().timestamp,
    score: d.data().score,
    riskLevel: d.data().riskLevel,
  }));
}

/* -----------------------------------------------------------
   LOAD RAW FRAUD EVENTS (for PDF reports)
----------------------------------------------------------- */
export async function loadFraudEvents(days = 7) {
  const since = Date.now() - days * 24 * 3600 * 1000;

  const qRef = query(
    collection(db, "fraudEvents"),
    where("timestamp", ">=", since),
    orderBy("timestamp", "desc")
  );

  const snap = await getDocs(qRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* -----------------------------------------------------------
   LOAD ALL LISTINGS FOR ADMIN (for PDF)
----------------------------------------------------------- */
export async function loadListingsForAdmin() {
  const snap = await getDocs(collection(db, "listings"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* -----------------------------------------------------------
   AI-GENERATED INSIGHTS (Gemini summary)
----------------------------------------------------------- */
export async function loadAiInsights(days = 7) {
  try {
    const docRef = doc(db, "adminAnalytics", `insights_${days}d`);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data().insights || "" : "";
  } catch (err) {
    console.error("AI Insights load error", err);
    return "";
  }
}
