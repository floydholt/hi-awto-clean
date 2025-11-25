import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext.jsx";
import useUnreadMessages from "../hooks/useUnreadMessages";

export default function Navbar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarMenu, setAvatarMenu] = useState(false);
  const [shrink, setShrink] = useState(false);

  const avatarRef = useRef(null);
  const avatarMenuRef = useRef(null);

  const unread = useUnreadMessages(user?.uid); // 🔔 unread messages

  const isAdmin = role === "admin";

  const handleLogout = async () => {
    const { logout } = await import("../firebase/auth.js");
    await logout();
    navigate("/login");
  };

  // Shrink effect
  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close avatar menu when clicking outside
  useEffect(() => {
    function closeMenu(e) {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(e.target) &&
        !avatarRef.current.contains(e.target)
      ) {
        setAvatarMenu(false);
      }
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  // Avatar fallback initials
  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase();

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`
          fixed top-0 w-full z-50 bg-white/80 backdrop-blur border-b border-gray-200
          transition-all duration-300
          ${shrink ? "py-2 shadow-sm" : "py-4"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo-nav.png"
              className={`transition-all duration-300 ${shrink ? "h-6" : "h-8"}`}
              alt="HI AWTO"
            />
          </Link>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center gap-8 text-slate-800 font-medium">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <Link to="/how-it-works" className="hover:text-blue-600">How It Works</Link>

            {!user && (
              <>
                <Link to="/login" className="hover:text-blue-600">Login</Link>
                <Link to="/register" className="hover:text-blue-600">Register</Link>
              </>
            )}

            {user && (
              <>
                <Link to="/my-listings" className="hover:text-blue-600">My Listings</Link>

                {/* 🔔 Notification Bell */}
                <Link to="/messages" className="relative">
                  <span className="text-2xl">🔔</span>

                  {unread > 0 && (
                    <span className="
                      absolute -top-1 -right-2 bg-red-600 text-white 
                      text-[10px] px-1.5 py-[1px] rounded-full font-bold
                    ">
                      {unread}
                    </span>
                  )}
                </Link>

                {/* Avatar */}
                <div className="relative">
                  <button
                    ref={avatarRef}
                    onClick={() => setAvatarMenu((v) => !v)}
                    className="h-9 w-9 rounded-full bg-gray-200 border overflow-hidden shadow-sm hover:shadow-md"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-700">
                        {initials}
                      </div>
                    )}
                  </button>

                  {/* Avatar dropdown */}
                  {avatarMenu && (
                    <div
                      ref={avatarMenuRef}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 text-sm animate-fadeIn"
                    >
                      <Link to="/profile" className="block px-4 py-2 hover:bg-slate-50">Profile</Link>
                      <Link to="/messages" className="block px-4 py-2 hover:bg-slate-50">
                        Messages {unread > 0 && `(${unread})`}
                      </Link>
                      <Link to="/my-listings" className="block px-4 py-2 hover:bg-slate-50">My Listings</Link>

                      {isAdmin && (
                        <Link
                          to="/admin/messages"
                          className="block px-4 py-2 hover:bg-slate-50 text-green-600"
                        >
                          Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
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
        </div>
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
          transition-transform duration-300 ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <img src="/logo-nav.png" className="h-8" />
          <button className="text-3xl" onClick={() => setMenuOpen(false)}>✕</button>
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

          {user && (
            <>
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="h-12 w-12 rounded-full border overflow-hidden bg-gray-200">
                  {user.photoURL ? (
                    <img src={user.photoURL} className="h-full w-full object-cover" />
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

                {/* 🔔 Bell on mobile */}
                <Link to="/messages" className="relative ml-auto mr-2">
                  <span className="text-2xl">🔔</span>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </Link>
              </div>

              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/my-listings" onClick={() => setMenuOpen(false)}>My Listings</Link>
              <Link to="/messages" onClick={() => setMenuOpen(false)}>
                Messages {unread > 0 && `(${unread})`}
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/messages"
                  className="text-green-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-red-600 pt-2 text-left"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
