import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase";
import logo from "../assets/logo.png"; // Make sure logo.png exists in /src/assets

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded">
      <img src={logo} alt="HI-AWTO Logo" className="h-12 mx-auto mb-6" />
      <h1 className="text-2xl font-bold mb-2 text-center">Login</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
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
          Login
        </button>
      </form>

      <div className="mt-6 text-center text-slate-500">OR CONTINUE WITH</div>
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={handleGoogleLogin} className="bg-white border px-4 py-2 rounded shadow">
          Continue with Google
        </button>
        <button className="bg-white border px-4 py-2 rounded shadow" disabled>
          Continue with Apple
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don’t have an account? <Link to="/register" className="text-sky-600">Register</Link>
      </p>
    </div>
  );
}
