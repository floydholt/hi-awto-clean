// client/src/components/ContactForm.js
import React, { useState } from "react";
import { db } from "../firebase";  // <-- FIXED IMPORT
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("saving");

    try {
      await addDoc(collection(db, "leads"), {
        ...form,
        createdAt: serverTimestamp()
      });

      setForm({ name: "", email: "", phone: "", message: "" });
      setStatus("saved");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="card" id="apply">
      <form onSubmit={submit}>
        <div className="form-row">
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
          />
          <input
            className="input"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>

        <div className="form-row">
          <input
            className="input"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <textarea
            className="input"
            rows="5"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us about the home or area you want..."
          />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="button" type="submit">
            Submit Application
          </button>

          <div className="small">
            {status === "saving" && "Saving..."}
            {status === "saved" && "Application sent — we'll follow up"}
            {status === "error" && "Error saving — try again"}
          </div>
        </div>
      </form>
    </div>
  );
}
