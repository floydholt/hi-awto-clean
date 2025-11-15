// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "hi-awto.firebaseapp.com",
  projectId: "hi-awto",
  storageBucket: "hi-awto.appspot.com",
  messagingSenderId: "847688831723",
  appId: process.env.REACT_APP_FIREBASE_APPID || "1:847688831723:web:xxxxxxxx",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
