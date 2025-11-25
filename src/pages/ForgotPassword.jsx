import React, { useState } from "react";
import { resetPassword } from "../firebase/auth.js";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    }
  };

  return (
    <div className="auth-wrapper fade-in">
      <img src="/logo.png" className="auth-logo" alt="HI AWTO" />

      <h1 className="auth-title">Reset Password</h1>
      <p className="auth-subtitle">We'll send you a link to reset it.</p>

      {error && <div className="auth-error">{error}</div>}
      {sent && (
        <div className="auth-success">
          A reset link has been sent to your email.
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-card">
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="auth-button">
          Send Reset Link
        </button>
      </form>

      <p className="auth-link">
        <Link to="/login">← Back to Login</Link>
      </p>
    </div>
  );
}
