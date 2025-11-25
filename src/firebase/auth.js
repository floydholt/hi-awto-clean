// src/firebase/auth.js
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { app } from "./config.js";

// Use the already-initialized app from config.js
export const auth = getAuth(app);

// -------------------------
// Email/password auth
// -------------------------
export async function loginUser({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerUser({ email, password, displayName }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }

  return cred;
}

export async function logout() {
  return signOut(auth);
}

// -------------------------
// Password reset
// -------------------------
export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

// -------------------------
// Google Sign-In
// -------------------------
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

// Alias for compatibility
export const loginWithGoogle = signInWithGoogle;

// -------------------------
// Apple Sign-In
// -------------------------
export async function signInWithApple() {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  return signInWithPopup(auth, provider);
}

// Alias for compatibility
export const loginWithApple = signInWithApple;
