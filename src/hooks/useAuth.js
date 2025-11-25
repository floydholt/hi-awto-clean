// client/src/hooks/useAuth.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

/**
 * AuthContext + provider so components can access current user and role.
 *
 * Exports:
 * - AuthProvider: wrap your app in this in index.jsx (if not already)
 * - useAuth: hook returning { user, role, loading }
 * - useAuthContext: direct context access (some components import this)
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) setRole(snap.data().role || "user");
          else setRole("user");
        } catch (err) {
          console.error("Error fetching role:", err);
          setRole("user");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// primary hook used by components
export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, role: null, loading: true };
  return ctx;
}

// named export some components refer to
export function useAuthContext() {
  return useContext(AuthContext);
}
