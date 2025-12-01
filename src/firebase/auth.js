// src/firebase/auth.js
import { auth } from "./index.js";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

/* -------------------------------------------
   EMAIL/PASSWORD LOGIN
------------------------------------------- */
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Legacy compatibility
export const loginUser = login;

/* -------------------------------------------
   GOOGLE LOGIN
------------------------------------------- */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

// Legacy compatibility alias
export const loginWithGoogle = signInWithGoogle;


/* -------------------------------------------
   APPLE LOGIN
------------------------------------------- */
export async function signInWithApple() {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");

  return await signInWithPopup(auth, provider);
}

// Legacy compatibility alias
export const loginWithApple = signInWithApple;

/* -------------------------------------------
   REGISTER EMAIL/PASSWORD
------------------------------------------- */
export function register(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Legacy compatibility
export const registerUser = register;

/* -------------------------------------------
   PASSWORD RESET
------------------------------------------- */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}
