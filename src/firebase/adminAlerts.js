// src/firebase/adminAlerts.js
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firestore"; // matches style of adminAnalytics.js

// Real-time listener for latest admin alerts
export function listenToAdminAlerts(callback, max = 20) {
  const q = query(
    collection(db, "admin_alerts"),
    orderBy("createdAt", "desc"),
    limit(max)
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(items);
  });
}

// Mark a specific alert as read for a given admin UID
export async function markAdminAlertRead(alertId, uid) {
  if (!alertId || !uid) return;
  const ref = doc(db, "admin_alerts", alertId);
  await updateDoc(ref, {
    readBy: arrayUnion(uid),
  });
}
