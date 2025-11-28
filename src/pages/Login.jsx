import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser, signInWithGoogle, signInWithApple } from "../firebase/auth.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(form);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApple = async () => {
    try {
      await signInWithApple();
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper fade-in">
      <img src="/logo.png" alt="HI AWTO logo" />


      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-subtitle">Log in to continue your journey</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-card">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="auth-input"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="auth-input"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading ? "Logging in…" : "Log In"}
        </button>

        <Link to="/forgot" className="text-xs text-center text-blue-600 mt-2">
          Forgot your password?
        </Link>
      </form>

      {/* SOCIAL LOGIN */}
      <div className="auth-card mt-3 space-y-3">
        <button
          onClick={handleGoogle}
          className="auth-social-button bg-white border text-gray-700"
        >
          Sign in with Google
        </button>

        <button
          onClick={handleApple}
          className="auth-social-button bg-black text-white"
        >
          Sign in with Apple
        </button>
      </div>

      <p className="auth-link">
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
