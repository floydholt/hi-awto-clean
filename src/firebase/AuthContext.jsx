// src/firebase/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, subscribeToAuth, getDocument } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);        // admin / agent / seller / buyer
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(async (user) => {
      if (user) {
        setCurrentUser(user);

        // load role from Firestore
        const roleDoc = await getDocument(`roles/${user.uid}`);
        setUserRole(roleDoc?.role || "buyer");
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
