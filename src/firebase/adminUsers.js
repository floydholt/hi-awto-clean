import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firestore.js";

export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function promoteUser(uid) {
  return updateDoc(doc(db, "users", uid), {
    role: "admin",
  });
}

export async function demoteUser(uid) {
  return updateDoc(doc(db, "users", uid), {
    role: "user",
  });
}

export async function suspendUser(uid) {
  return updateDoc(doc(db, "users", uid), {
    suspended: true,
  });
}

export async function unsuspendUser(uid) {
  return updateDoc(doc(db, "users", uid), {
    suspended: false,
  });
}
