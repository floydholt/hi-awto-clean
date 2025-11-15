// client/src/components/AdminLogin.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";  // <-- FIXED IMPORT
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", cred.user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const role = snap.data().role;
        if (role === "admin") navigate("/admin");
        else if (role === "seller") navigate("/seller-dashboard");
        else navigate("/");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or error signing in.");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: "40px auto" }}>
      <h3>Admin / Seller Login</h3>
      <form onSubmit={handleLogin}>
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <button className="button" type="submit">
          Log In
        </button>
      </form>

      {error && <p className="small" style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
