// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext.jsx";

export default function Navbar({ unread = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  // ✅ FIX: Destructure 'role' to enable admin checks
  const { user, role, logout } = useAuth(); 

  const isAdmin = role === "admin"; // ✅ Added helper variable

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials =
    user?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="HI-AWTO logo"
            className="h-10 w-auto"
          />
          <span className="font-bold text-xl text-blue-700">HI-AWTO</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link to="/how-it-works" className="hover:text-blue-600 transition">
            How It Works
          </Link>
          <Link to="/search" className="hover:text-blue-600 transition">
            Search
          </Link>

          {!user && (
            <>
              <Link to="/login" className="hover:text-blue-600 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              {/* MESSAGES BUTTON */}
              <Link to="/messages" className="relative">
                <span className="text-2xl">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full">
                    {unread}
                  </span>
                )}
              </Link>

              {/* AVATAR + DROPDOWN */}
              {/* Using a relative parent div for positioning */}
              <div className="relative group"> 
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-semibold text-slate-700">
                        {initials}
                        {/* ❌ REMOVED: Misplaced admin links here */}
                      </div>
                    )}
                  </div>
                </div>
                {/* ❌ REMOVED: Duplicate useAuth call */}

                {/* DROPDOWN */}
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-slate-100 hidden group-hover:block">
                  <Link
                    to="/profile" // ✅ Changed from /dashboard
                    className="block px-4 py-2 hover:bg-slate-50 text-sm"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-listings"
                    className="block px-4 py-2 hover:bg-slate-50 text-sm"
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-4 py-2 hover:bg-slate-50 text-sm"
                  >
                    Messages {unread > 0 && `(${unread})`}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 hover:bg-slate-50 text-sm text-blue-600 font-medium"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
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

      {/* BACKDROP */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE MENU */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full bg-white shadow-lg z-50 transition-transform duration-300 ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <img
            src="/logo.png"
            alt="HI-AWTO logo"
            className="h-10 w-auto"
          />

          <button className="text-3xl" onClick={() => setMenuOpen(false)}>
            ✕
          </button>
        </div>

        <div className="flex flex-col px-6 py-4 space-y-4 text-lg">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/how-it-works" onClick={() => setMenuOpen(false)}>
            How It Works
          </Link>
          <Link to="/search" onClick={() => setMenuOpen(false)}>
            Search
          </Link>

          {!user && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="h-12 w-12 rounded-full border overflow-hidden bg-gray-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-semibold text-slate-700">
                      {initials}
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-semibold">{user.displayName || "User"}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>

                <Link to="/messages" className="relative ml-auto mr-2">
                  <span className="text-2xl">🔔</span>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </Link>
              </div>

              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/my-listings" onClick={() => setMenuOpen(false)}>
                My Listings
              </Link>
              <Link to="/messages" onClick={() => setMenuOpen(false)}>
                Messages {unread > 0 && `(${unread})`}
              </Link>

              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-blue-600 font-medium">
                  Admin Panel
                </Link>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="text-red-600 text-left"
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