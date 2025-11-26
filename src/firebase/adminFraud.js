// src/firebase/adminFraud.js
import {
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { db } from "./config.js";

// Stream ALL listings with fraudScore or fraudReasons
export function listenToFraudListings(callback) {
  const q = query(
    collection(db, "listings"),
    where("fraudScore", ">=", 0),
    orderBy("fraudScore", "desc")
  );

  return onSnapshot(q, (snap) => {
    const results = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(results);
  });
}

// Admin override — mark safe
export async function markListingSafe(id) {
  await updateDoc(doc(db, "listings", id), {
    fraudScore: null,
    fraudReasons: [],
    fraudSummary: "",
    fraudReviewedAt: new Date(),
    fraudStatus: "safe",
  });
}

// Admin override — force flag as fraud
export async function flagAsFraud(id) {
  await updateDoc(doc(db, "listings", id), {
    fraudStatus: "fraud",
    fraudReviewedAt: new Date(),
  });
}
