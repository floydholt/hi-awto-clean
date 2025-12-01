// src/firebase/listings.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "./index.js"; // ✔ correct import

/* -------------------------------------------------------
   GET LISTING BY ID
------------------------------------------------------- */
export async function getListing(listingId) {
  const ref = doc(db, "listings", listingId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Alias for backwards compatibility
export const getListingById = getListing;

/* -------------------------------------------------------
   CREATE LISTING
------------------------------------------------------- */
export async function createListing(data) {
  const defaultData = {
    title: "",
    address: "",
    price: 0,
    downPayment: 0,
    sqft: 0,
    beds: 0,
    baths: 0,
    description: "",
    imageUrls: [],
    uid: data.uid || null,
    createdAt: new Date(),
    updatedAt: new Date(),

    // Moderation + AI defaults
    status: "pending",
    aiTags: [],
    aiCaption: "",
    aiFullDescription: "",
    aiPricing: null,
    aiFraud: null,
    aiPhotoTypes: [],
  };

  const docRef = await addDoc(collection(db, "listings"), {
    ...defaultData,
    ...data,
  });

  return docRef.id;
}

/* -------------------------------------------------------
   UPDATE LISTING
------------------------------------------------------- */
export async function updateListing(id, updates) {
  const docRef = doc(db, "listings", id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
}

/* -------------------------------------------------------
   DELETE LISTING
------------------------------------------------------- */
export async function deleteListing(id) {
  const docRef = doc(db, "listings", id);
  await deleteDoc(docRef);
}

/* -------------------------------------------------------
   GET USER'S LISTINGS
------------------------------------------------------- */
export async function getMyListings(uid) {
  if (!uid) return [];

  const q = query(
    collection(db, "listings"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* -------------------------------------------------------
   SEARCH LISTINGS
------------------------------------------------------- */
export async function queryListings({
  minPrice = 0,
  maxPrice = Infinity,
  beds,
  baths,
  status = "approved",
  limitResults = 30,
} = {}) {
  let constraints = [where("status", "==", status)];

  if (beds) constraints.push(where("beds", ">=", beds));
  if (baths) constraints.push(where("baths", ">=", baths));
  if (minPrice > 0) constraints.push(where("price", ">=", minPrice));
  if (maxPrice < Infinity) constraints.push(where("price", "<=", maxPrice));

  const q = query(
    collection(db, "listings"),
    ...constraints,
    orderBy("price", "asc"),
    limit(limitResults)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* -------------------------------------------------------
   ADMIN: GET ALL LISTINGS
------------------------------------------------------- */
export async function getAllListings() {
  const snap = await getDocs(collection(db, "listings"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
