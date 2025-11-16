// client/src/components/CreateAccount.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CreateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seller");
  const [message, setMessage] = useState("");

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role,
        createdAt: serverTimestamp(),
      });
      setMessage(`User created: ${email} (${role})`);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Error creating user");
    }
  };

  return (
    <div className="card" style={{ marginTop: 30 }}>
      <h3>Create New Seller Account</h3>
      <form onSubmit={createUser}>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <button className="button" type="submit">Create Account</button>
      </form>
      {message && <p className="small">{message}</p>}
    </div>
  );
}
