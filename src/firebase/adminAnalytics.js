// src/firebase/adminAnalytics.js
import { db } from "./index.js";
import {
  collection,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

/* ---------------------------------------------------------
   REALTIME ADMIN METRIC STREAMS
--------------------------------------------------------- */

export function streamNewUsers(callback) {
  const q = query(
    collection(db, "users"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function streamNewListings(callback) {
  const q = query(
    collection(db, "listings"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function streamFraudEvents(callback) {
  const q = query(
    collection(db, "fraudEvents"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/* ---------------------------------------------------------
   FETCH SPECIFIC METRICS
--------------------------------------------------------- */

export async function getListingOwner(listingId) {
  const ref = doc(db, "listings", listingId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().ownerId : null;
}

export async function getUserDetails(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/* ---------------------------------------------------------
   LISTING COUNTS LISTENER (legacy support)
--------------------------------------------------------- */

export function listenToListingCounts(callback) {
  const ref = collection(db, "listings");

  return onSnapshot(ref, (snap) => {
    const total = snap.size;

    const published = snap.docs.filter(
      (d) => d.data().status === "published"
    ).length;

    const pending = snap.docs.filter(
      (d) => d.data().status === "pending"
    ).length;

    const rejected = snap.docs.filter(
      (d) => d.data().status === "rejected"
    ).length;

    callback({
      total,
      published,
      pending,
      rejected,
    });
  });
}

/* ---------------------------------------------------------
   USER COUNTS LISTENER (legacy support)
--------------------------------------------------------- */

export function listenToUserCounts(callback) {
  const ref = collection(db, "users");

  return onSnapshot(ref, (snap) => {
    const total = snap.size;

    // safe role parsing
    const roles = snap.docs.map((d) => d.data().role || "unknown");

    const admins = roles.filter((r) => r === "admin").length;
    const buyers = roles.filter((r) => r === "buyer").length;
    const sellers = roles.filter((r) => r === "seller").length;
    const unknown = roles.filter(
      (r) => !["admin", "buyer", "seller"].includes(r)
    ).length;

    callback({
      total,
      admins,
      buyers,
      sellers,
      unknown,
    });
  });
}

/* ---------------------------------------------------------
   THREAD COUNTS LISTENER (legacy support)
--------------------------------------------------------- */

export function listenToThreadCounts(callback) {
  const ref = collection(db, "threads");

  return onSnapshot(ref, (snap) => {
    const total = snap.size;

    const statuses = snap.docs.map(
      (d) => d.data().status || "active"
    );

    const active = statuses.filter((s) => s === "active").length;
    const closed = statuses.filter((s) => s === "closed").length;
    const unknown = statuses.filter(
      (s) => !["active", "closed"].includes(s)
    ).length;

    callback({
      total,
      active,
      closed,
      unknown,
    });
  });
}

/* ---------------------------------------------------------
   LOAD LISTINGS TIME SERIES (for charts)
--------------------------------------------------------- */
export async function loadListingsTimeSeries(days = 7) {
  const start = Date.now() - days * 24 * 60 * 60 * 1000;

  const q = query(
    collection(db, "listings"),
    where("createdAt", ">=", new Date(start)),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);

  const buckets = {};

  snap.forEach((d) => {
    const ts = d.data().createdAt?.toDate?.() || new Date();
    const label = ts.toLocaleDateString();

    if (!buckets[label]) buckets[label] = 0;
    buckets[label]++;
  });

  return Object.keys(buckets).map((label) => ({
    label,
    count: buckets[label],
  }));
}

/* ---------------------------------------------------------
   LOAD AI INSIGHTS (AI Summary Panel)
--------------------------------------------------------- */
export async function loadAiInsights(days = 7) {
  return "AI insights not available (placeholder).";
}

/* ---------------------------------------------------------
   LOAD FRAUD EVENTS (for FraudReportPanel)
--------------------------------------------------------- */
export async function loadFraudEvents(days = 7) {
  const start = Date.now() - days * 24 * 60 * 60 * 1000;

  const q = query(
    collection(db, "fraudEvents"),
    where("createdAt", ">=", new Date(start)),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------------------------------------------------
   LOAD LISTINGS FOR ADMIN (moderation)
--------------------------------------------------------- */
export async function loadListingsForAdmin() {
  const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------------------------------------------------
   FRAUD RISK TIME SERIES (chart)
--------------------------------------------------------- */
export async function loadFraudTrends(days = 7) {
  const start = Date.now() - days * 24 * 60 * 60 * 1000;

  const q = query(
    collection(db, "fraudEvents"),
    where("createdAt", ">=", new Date(start)),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    timestamp: d.data().createdAt?.toDate?.() || new Date(),
    score: d.data().score || 0,
    riskLevel:
      d.data().score >= 80
        ? "high"
        : d.data().score >= 50
        ? "medium"
        : "low",
  }));
}
