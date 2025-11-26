// src/firebase/adminAnalytics.js
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "./firestore.js";

/* ---------------------------------------------------------
   LIVE COUNTS (TOTALS)
--------------------------------------------------------- */
export function listenToListingCounts(callback) {
  return onSnapshot(collection(db, "listings"), (snap) => {
    const total = snap.size;
    let approved = 0,
      pending = 0,
      rejected = 0;
    const recentListings = [];

    snap.forEach((doc) => {
      const l = doc.data();
      if (l.status === "approved") approved++;
      else if (l.status === "pending") pending++;
      else if (l.status === "rejected") rejected++;

      if (recentListings.length < 8) {
        recentListings.push({
          id: doc.id,
          ...l,
        });
      }
    });

    callback({
      total,
      approved,
      pending,
      rejected,
      recentListings,
    });
  });
}

export function listenToUserCounts(callback) {
  return onSnapshot(collection(db, "users"), (snap) => {
    const total = snap.size;
    let admins = 0;
    const recentUsers = [];

    snap.forEach((doc) => {
      const u = doc.data();
      if (u.role === "admin") admins++;

      if (recentUsers.length < 8) {
        recentUsers.push({
          id: doc.id,
          ...u,
        });
      }
    });

    callback({ total, admins, recentUsers });
  });
}

export function listenToThreadCounts(callback) {
  return onSnapshot(collection(db, "threads"), (snap) => {
    const totalThreads = snap.size;
    let activeLast7d = 0;

    const now = Date.now();
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;

    snap.forEach((doc) => {
      const t = doc.data();
      if (t.updatedAt?.toMillis?.() > cutoff) activeLast7d++;
    });

    callback({ totalThreads, activeLast7d });
  });
}

/* ---------------------------------------------------------
   LISTINGS TIME SERIES (CHART DATA)
--------------------------------------------------------- */
export async function loadListingsTimeSeries(days) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const q = query(
    collection(db, "listings"),
    where("createdAt", ">=", cutoffDate),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);
  const buckets = {};

  snap.forEach((doc) => {
    const d = doc.data();
    const ts = d.createdAt?.toDate?.();
    if (!ts) return;

    const label = ts.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    buckets[label] = (buckets[label] || 0) + 1;
  });

  return Object.keys(buckets).map((label) => ({
    label,
    count: buckets[label],
  }));
}
