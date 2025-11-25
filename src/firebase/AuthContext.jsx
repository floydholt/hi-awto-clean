import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./auth";
import {
  onAuthStateChanged,
  getIdTokenResult,
} from "firebase/auth";

const AuthContext = createContext();

// -------------------------------------------------
// PROVIDER
// -------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" or "user"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load custom claims (admin role)
        const token = await getIdTokenResult(firebaseUser);
        const isAdmin = token.claims.admin === true;

        setUser(firebaseUser);
        setRole(isAdmin ? "admin" : "user");
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// -------------------------------------------------
// HOOK
// -------------------------------------------------
export function useAuth() {
  return useContext(AuthContext);
}
