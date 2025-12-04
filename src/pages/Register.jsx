// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, saveDocument } from "../firebase";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { user } = await registerUser(email, password);

      // Save role
      await saveDocument(`roles/${user.uid}`, { role: "buyer" });

      // Save display name
      await user.updateProfile({ displayName: fullName });

      navigate("/app");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center py-20">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center space-y-6">
        
        {/* Logo */}
        <img
          src="/logo512.png"
          className="h-12 mx-auto opacity-90"
          alt="HI AWTO Logo"
        />

        <h2 className="text-2xl font-semibold">Create Account</h2>
        <p className="text-slate-500 text-sm">Join the new way to own</p>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200"
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 shadow">
            Register
          </button>
        </form>

        <div className="w-full border-t pt-4 text-sm text-slate-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
