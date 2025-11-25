// client/src/components/Header.js
import React from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Header() {
  const { user } = useAuth();
  return (
    <header className="header">
      <div className="brand">
        <img src={logo} alt="Hi-Awto logo" />
        <div>
          <div style={{ fontWeight: 700 }}>Hi-Awto</div>
          <div className="small">Lease Purchase | Rent-to-Own Listings</div>
        </div>
      </div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/listings">Listings</Link>
        <a href="#apply">Apply</a>
        {user ? <Link to="/admin">Admin</Link> : <Link to="/login">Login</Link>}
      </nav>
    </header>
  );
}
