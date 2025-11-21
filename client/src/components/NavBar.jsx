// client/src/components/NavBar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function NavBar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  // ------------------------------
  // UNREAD BADGE LISTENER
  // ------------------------------
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "threads"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      let total = 0;

      snap.forEach((doc) => {
        const data = doc.data();
        const unread = data.unreadCount?.[user.uid] || 0;
        total += unread;
      });

      setUnreadCount(total);
    });

    return () => unsub();
  }, [user]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="w-full bg-white shadow-md px-4 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold">HIAWTO</Link>

      <div className="flex items-center gap-4">

        <Link to="/" className="hover:text-blue-600">Home</Link>

        {/* ----------------------------- */}
        {/* Messages with unread badge */}
        {/* ----------------------------- */}
        {user && (
          <Link to="/messages" className="relative hover:text-blue-600">
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* ADMIN */}
        {isAdmin && (
          <Link to="/admin/messages" className="hover:text-blue-600">
            Admin Panel
          </Link>
        )}

        {/* Login/Logout */}
        {!user && (
          <Link to="/login" className="hover:text-blue-600">Login</Link>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="text-red-600 font-medium hover:opacity-80"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
