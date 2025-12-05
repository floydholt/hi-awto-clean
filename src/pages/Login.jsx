import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import logo from "../assets/logo.png"; // Make sure logo.png exists in /src/assets

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔐 Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Force token refresh to ensure latest claims
      await userCredential.user.getIdToken(true);
      const token = await userCredential.user.getIdTokenResult();
      const role = token.claims.role || "buyer";

      if (role === "seller") navigate("/seller/dashboard");
      else if (role === "agent") navigate("/agent/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  // 🔐 Google Login with Role Detection
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Force token refresh to ensure latest claims
      await auth.currentUser.getIdToken(true);
      const tokenResult = await auth.currentUser.getIdTokenResult();
      const role = tokenResult.claims.role || "buyer";

      if (role === "seller") navigate("/seller/dashboard");
      else if (role === "agent") navigate("/agent/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded shadow">
      <img src={logo} alt="HI-AWTO Logo" className="h-12 mx-auto mb-6" />
      <h1 className="text-2xl font-bold mb-2 text-center">Login</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Email/Password Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700"
        >
          Login
        </button>
      </form>

      {/* Divider */}
      <div className="mt-6 text-center text-slate-500">OR CONTINUE WITH</div>

      {/* Social Login Buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={handleGoogleLogin}
          className="bg-white border px-4 py-2 rounded shadow hover:bg-slate-50"
        >
          Continue with Google
        </button>
        <button className="bg-white border px-4 py-2 rounded shadow" disabled>
          Continue with Apple
        </button>
      </div>

      {/* Register Link */}
      <p className="mt-6 text-center text-sm text-slate-600">
        Don’t have an account?{" "}
        <Link to="/register" className="text-sky-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
