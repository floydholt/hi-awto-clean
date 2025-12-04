// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { resetPassword } from "../firebase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      await resetPassword(email);
      setMsg("Password reset email sent!");
    } catch (error) {
      setErr(error.message);
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

        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <p className="text-slate-500 text-sm">
          Enter your email and we’ll send you reset instructions.
        </p>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        {msg && <p className="text-green-600 text-sm">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 shadow">
            Send Reset Email
          </button>
        </form>

        <div className="w-full border-t pt-4 text-sm text-slate-500">
          Remember your password?{" "}
          <a href="/login" className="text-blue-600">
            Log In
          </a>
        </div>
      </div>
    </div>
  );
}
