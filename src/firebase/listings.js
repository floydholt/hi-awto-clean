// src/firebase/listings.js
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// -------------------------------------------------
// CREATE LISTING
// -------------------------------------------------
export async function createListing(data) {
  const ref = await addDoc(collection(db, "listings"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approved: false, // admin moderation
  });
  return ref.id;
}

// -------------------------------------------------
// GET ALL LISTINGS (Public Marketplace Search)
// -------------------------------------------------
export async function getAllListings() {
  const q = query(
    collection(db, "listings"),
    where("approved", "==", true),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// -------------------------------------------------
// GET LISTING BY ID
// -------------------------------------------------
export async function getListingById(id) {
  const ref = doc(db, "listings", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// -------------------------------------------------
// GET LISTINGS FOR CURRENT USER
// (My Listings – dashboard)
// -------------------------------------------------
export async function getMyListings(userId) {
  const q = query(
    collection(db, "listings"),
    where("owner", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// -------------------------------------------------
// ADMIN: GET ALL LISTINGS (approved + pending)
// -------------------------------------------------
export async function adminGetAllListings() {
  const q = query(
    collection(db, "listings"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// -------------------------------------------------
// UPDATE LISTING (edit, approve, deny, etc.)
// -------------------------------------------------
export async function updateListing(id, data) {
  const ref = doc(db, "listings", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// -------------------------------------------------
// DELETE LISTING
// -------------------------------------------------
export async function deleteListing(id) {
  await deleteDoc(doc(db, "listings", id));
}
