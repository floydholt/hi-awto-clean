// src/firebase/adminListings.js
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./config.js";

// Stream ALL listings (pending, approved, rejected)
export function listenToModerationListings(callback) {
  const q = query(
    collection(db, "listings"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const listings = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(listings);
  });
}

export async function approveListing(id) {
  await updateDoc(doc(db, "listings", id), {
    moderationStatus: "approved",
    moderationNotes: "",
    reviewedAt: new Date(),
  });
}

export async function rejectListing(id, reason) {
  await updateDoc(doc(db, "listings", id), {
    moderationStatus: "rejected",
    moderationNotes: reason,
    reviewedAt: new Date(),
  });
}
