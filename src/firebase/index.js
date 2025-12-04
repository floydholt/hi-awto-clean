// src/firebase/index.js
// Master Firebase Client SDK – full unified API for entire project

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "./config";

// ---------------------------------------------------------------------------
// INIT APP SAFELY
// ---------------------------------------------------------------------------
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");

// ---------------------------------------------------------------------------
// AUTH HELPERS
// ---------------------------------------------------------------------------
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function registerUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function updateUserProfile(data) {
  if (!auth.currentUser) return;
  return updateProfile(auth.currentUser, data);
}

// ---------------------------------------------------------------------------
// LISTINGS
// ---------------------------------------------------------------------------
export async function getListings(limitCount = 50) {
  const q = query(
    collection(db, "listings"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getListing(id) {
  const ref = doc(db, "listings", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function searchListings(text) {
  const q = query(
    collection(db, "listings"),
    where("searchKeywords", "array-contains", text.toLowerCase())
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateListing(id, data) {
  const ref = doc(db, "listings", id);
  return updateDoc(ref, data);
}

// ---------------------------------------------------------------------------
// PROFILE IMAGE UPLOAD
// ---------------------------------------------------------------------------
export async function uploadProfileImage(uid, file) {
  const fileRef = ref(storage, `profileImages/${uid}.jpg`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

// ---------------------------------------------------------------------------
// GENERIC FIRESTORE HELPERS
// ---------------------------------------------------------------------------
export async function saveDocument(path, data) {
  const ref = doc(db, path);
  return setDoc(ref, data, { merge: true });
}

export async function getDocument(path) {
  const ref = doc(db, path);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ---------------------------------------------------------------------------
// MESSAGING (Admin + Agent)
// ---------------------------------------------------------------------------
export async function sendMessage(threadId, message) {
  const threadRef = collection(db, "threads", threadId, "messages");
  return addDoc(threadRef, {
    ...message,
    timestamp: serverTimestamp()
  });
}

export async function fetchThread(threadId) {
  const threadRef = collection(db, "threads", threadId, "messages");
  const q = query(threadRef, orderBy("timestamp", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}





// ---------------------------------------------------------------------------
// EXPORT EVERYTHING FOR USE IN REACT PAGES
// ---------------------------------------------------------------------------
export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
};

export default app;
