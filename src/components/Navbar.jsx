/* Navbar.jsx content placeholder */

import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo512.png" alt="HI AWTO Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold text-sky-700">HI-AWTO</span>
        </Link>

        <div className="flex items-center space-x-6 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-sky-600">Home</Link>
          <Link to="/how-it-works" className="hover:text-sky-600">How It Works</Link>
          <Link to="/search" className="hover:text-sky-600">Search</Link>
          <Link to="/login" className="hover:text-sky-600">Login</Link>

          <Link
            to="/register"
            className="rounded-full bg-sky-600 px-4 py-1.5 text-white shadow hover:bg-sky-700"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
