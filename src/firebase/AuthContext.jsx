import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "./auth";
import { db } from "./config.js";   // or wherever you export your Firestore instance



const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole("user");
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      // Load role document from Firestore
      const ref = doc(db, "users", firebaseUser.uid);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setRole(snapshot.data().role || "user");
      } else {
        setRole("user");
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
