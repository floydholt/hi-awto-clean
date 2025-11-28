// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const isAdmin = role === "admin";

  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Compute initials
  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // Get unread message count
  useEffect(() => {
    if (!user?.uid) return;

    const ref = collection(db, "threads");
    const q = query(ref, where("participants", "array-contains", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      let count = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        const unreadMap = data.unreadCount || {};
        if (unreadMap[user.uid] > 0) count += unreadMap[user.uid];
      });
      setUnread(count);
    });

    return () => unsub();
  }, [user?.uid]);

  // Logout handler
  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="HI AWTO logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm">

          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/how-it-works" className="hover:text-blue-600">How It Works</Link>

          {/* ADMIN MENU */}
          {isAdmin && (
            <div className="relative">
              <button
                className="px-3 py-2 text-sm font-medium hover:text-blue-600"
                onClick={() => setAdminOpen(!adminOpen)}
              >
                Admin ▼
              </button>

              {adminOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-xl rounded-lg border w-52 z-50">
                  <Link
                    to="/admin/listings"
                    className="block px-4 py-2 text-sm hover:bg-slate-100"
                    onClick={() => setAdminOpen(false)}
                  >
                    Moderate Listings
                  </Link>

                  <Link
                    to="/admin/fraud"
                    className="block px-4 py-2 text-sm hover:bg-slate-100"
                    onClick={() => setAdminOpen(false)}
                  >
                    Fraud Review
                  </Link>

                  <Link
                    to="/admin/users"
                    className="block px-4 py-2 text-sm hover:bg-slate-100"
                    onClick={() => setAdminOpen(false)}
                  >
                    Manage Users
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {!user ? (
            <>
              <Link to="/login" className="hover:text-blue-600">Login</Link>
              <Link to="/register" className="hover:text-blue-600">Register</Link>
            </>
          ) : (
            <div className="relative">
              <button
                className="flex items-center gap-2"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="relative">
                  <span className="text-2xl">🔔</span>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </div>

                <div className="h-8 w-8 rounded-full border overflow-hidden bg-gray-200">
                  {user.photoURL ? (
                    <img src={user.photoURL} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-semibold text-slate-700">
                      {initials}
                    </div>
                  )}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-xl rounded-lg border w-48 z-50">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-slate-100"
                    onClick={() => setProfileOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/messages"
                    className="block px-4 py-2 text-sm hover:bg-slate-100"
                    onClick={() => setProfileOpen(false)}
                  >
                    Messages
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
      </nav>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE SLIDE DOWN MENU */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full bg-white shadow-lg z-50 
          transition-transform duration-300 
          ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <img src="/logo.png" alt="HI AWTO logo" className="h-10" />
          <button className="text-3xl" onClick={() => setMenuOpen(false)}>
            ✕
          </button>
        </div>

        <div className="flex flex-col px-6 py-4 space-y-4 text-lg">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link>

          {!user && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}

          {/* MOBILE ADMIN MENU */}
          {isAdmin && (
            <>
              <hr className="my-2" />
              <span className="text-xs text-slate-500 uppercase">Admin Tools</span>

              <Link
                to="/admin/listings"
                onClick={() => setMenuOpen(false)}
              >
                Moderate Listings
              </Link>

              <Link
                to="/admin/fraud"
                onClick={() => setMenuOpen(false)}
              >
                Fraud Review
              </Link>

              <Link
                to="/admin/users"
                onClick={() => setMenuOpen(false)}
              >
                Manage Users
              </Link>
            </>
          )}

          {user && (
            <>
              <hr className="my-2" />
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/messages" onClick={() => setMenuOpen(false)}>
                Messages
              </Link>

              <button
                onClick={handleLogout}
                className="text-red-600 text-left mt-2"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
