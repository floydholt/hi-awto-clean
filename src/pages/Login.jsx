// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginUser(email, password);
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

        <h2 className="text-2xl font-semibold">Welcome Back</h2>
        <p className="text-slate-500 text-sm">Log in to continue your journey</p>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
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
            Log In
          </button>
        </form>

        <a href="/forgot" className="text-sm text-blue-600 block">
          Forgot your password?
        </a>

        <div className="w-full border-t pt-4 text-sm text-slate-500">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
