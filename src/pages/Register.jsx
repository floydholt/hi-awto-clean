// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, loginWithGoogle, loginWithApple } from "../firebase/auth.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setSocialLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Google sign-in failed.");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleApple = async () => {
    setError("");
    setSocialLoading(true);
    try {
      await loginWithApple();
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Apple sign-in failed. Make sure Apple provider is configured."
      );
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="auth-wrapper fade-in">
      <img src="/logo.png" alt="HI AWTO" className="auth-logo" />

      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Join the new way to own</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-card">
        <input
          name="displayName"
          type="text"
          placeholder="Full Name"
          value={form.displayName}
          onChange={handleChange}
          className="auth-input"
          required
        />

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
          {loading ? "Creating account..." : "Register"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[11px] text-slate-400 uppercase tracking-wide">
            or continue with
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Social buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={socialLoading}
            className="w-full border border-slate-200 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50"
          >
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleApple}
            disabled={socialLoading}
            className="w-full border border-slate-900 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 bg-black text-white hover:bg-slate-900"
          >
            <span>Continue with Apple</span>
          </button>
        </div>
      </form>

      <p className="auth-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
