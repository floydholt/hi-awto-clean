import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase";
import logo from "../assets/logo.png";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded">
      <img src={logo} alt="HI-AWTO Logo" className="h-12 mx-auto mb-6" />
      <h1 className="text-2xl font-bold mb-2 text-center">Create Account</h1>
      <p className="text-center text-slate-600 mb-4">Join the new way to own</p>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-sky-600 text-white py-2 rounded">
          Register
        </button>
      </form>

      <div className="mt-6 text-center text-slate-500">OR CONTINUE WITH</div>
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={handleGoogleRegister} className="bg-white border px-4 py-2 rounded shadow">
          Continue with Google
        </button>
        <button className="bg-white border px-4 py-2 rounded shadow" disabled>
          Continue with Apple
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-sky-600">Login</Link>
      </p>
    </div>
  );
}
