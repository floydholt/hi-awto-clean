// src/firebase/fraudAnalytics.js
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "./firestore.js";

/* ---------------------------------------------------------
   FRAUD RISK TIME SERIES
--------------------------------------------------------- */
export async function loadFraudSeries(days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const q = query(
    collection(db, "fraudSignals"),
    where("createdAt", ">=", cutoff),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);
  const buckets = {};

  snap.forEach((doc) => {
    const f = doc.data();
    const ts = f.createdAt?.toDate?.();
    if (!ts) return;

    const label = ts.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (!buckets[label]) {
      buckets[label] = { total: 0, count: 0 };
    }

    buckets[label].total += f.score ?? 0;
    buckets[label].count += 1;
  });

  return Object.keys(buckets).map((label) => {
    const avg = buckets[label].total / buckets[label].count;
    return {
      label,
      avg: Number(avg.toFixed(2)),
      anomaly: avg >= 7.0, // highlight spikes
    };
  });
}
