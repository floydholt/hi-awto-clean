// src/firebase/listings.js
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getApp } from "firebase/app";

const db = getFirestore(getApp());


const LISTINGS_COL = "listings";

// Create a new listing (user-facing form)
export async function createListing(data) {
  const now = serverTimestamp();

  const payload = {
    title: data.title || "",
    address: data.address || "",
    price: typeof data.price === "number" ? data.price : Number(data.price) || 0,
    downPayment:
      typeof data.downPayment === "number"
        ? data.downPayment
        : Number(data.downPayment) || 0,
    description: data.description || "",
    featured: !!data.featured,
    imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
    // status / moderation
    status: "pending", // "pending" | "approved" | "rejected"
    approved: false,
    createdAt: now,
    updatedAt: now,

    // AI fields (populated by Cloud Functions)
    aiTags: data.aiTags || [],
    aiCaption: data.aiCaption || "",
    aiFullDescription: data.aiFullDescription || "",
    aiPricing: data.aiPricing || null,
    aiFraudScore:
      typeof data.aiFraudScore === "number" ? data.aiFraudScore : null,
    aiFraudReason: data.aiFraudReason || "",
  };

  const ref = await addDoc(collection(db, LISTINGS_COL), payload);
  return ref.id;
}

// Update listing (generic)
export async function updateListing(id, data) {
  const ref = doc(db, LISTINGS_COL, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Delete listing
export async function deleteListing(id) {
  const ref = doc(db, LISTINGS_COL, id);
  await deleteDoc(ref);
}

// Get single listing
export async function getListingById(id) {
  const ref = doc(db, LISTINGS_COL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Public listings (only approved)
export async function getAllListings() {
  const q = query(
    collection(db, LISTINGS_COL),
    where("approved", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// For /search page (same as above, but kept explicit)
export async function searchApprovedListings() {
  return getAllListings();
}

// Current user's listings (for /my-listings)
export async function getMyListings(userId) {
  if (!userId) return [];
  const q = query(
    collection(db, LISTINGS_COL),
    where("ownerId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// -----------------------------
// ADMIN HELPERS
// -----------------------------

// Get all listings for admin with optional status filter
export async function getAdminListings(statusFilter = "all") {
  const colRef = collection(db, LISTINGS_COL);

  let q;
  if (statusFilter === "all") {
    q = query(colRef, orderBy("createdAt", "desc"));
  } else {
    q = query(
      colRef,
      where("status", "==", statusFilter),
      orderBy("createdAt", "desc")
    );
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Approve listing
export async function approveListing(id) {
  const ref = doc(db, LISTINGS_COL, id);
  await updateDoc(ref, {
    approved: true,
    status: "approved",
    updatedAt: serverTimestamp(),
  });
}

// Reject listing
export async function rejectListing(id, reason = "") {
  const ref = doc(db, LISTINGS_COL, id);
  await updateDoc(ref, {
    approved: false,
    status: "rejected",
    rejectionReason: reason,
    updatedAt: serverTimestamp(),
  });
}

// Reset to pending
export async function resetListingToPending(id) {
  const ref = doc(db, LISTINGS_COL, id);
  await updateDoc(ref, {
    approved: false,
    status: "pending",
    updatedAt: serverTimestamp(),
  });
}

// Toggle featured
export async function setListingFeatured(id, featured) {
  const ref = doc(db, LISTINGS_COL, id);
  await updateDoc(ref, {
    featured: !!featured,
    updatedAt: serverTimestamp(),
  });
}
