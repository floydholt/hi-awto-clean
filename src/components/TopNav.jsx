import React from "react";
import { useAuth } from "../firebase/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function TopNav({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // redirect after logout
  };

  return (
    <header className="w-full bg-white shadow px-6 py-3 flex items-center justify-between">
      {/* Left side: role indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sky-600 font-bold">HI-AWTO</span>
        <span className="text-sm text-slate-500">({role} view)</span>
      </div>

      {/* Right side: user info + actions */}
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-slate-700 text-sm">
            {user.email}
          </span>
        )}
        <Link
          to="/"
          className="text-sm text-sky-600 hover:text-sky-800"
        >
          Home
        </Link>
        <button
          onClick={handleLogout}
          className="bg-sky-600 text-white px-3 py-1 rounded hover:bg-sky-700 text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
