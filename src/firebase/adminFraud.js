// src/firebase/adminFraud.js
import { db } from "./index.js";
import {
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

export async function getFraudEvents() {
  const ref = collection(db, "fraudEvents");
  const q = query(ref, orderBy("createdAt", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


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
