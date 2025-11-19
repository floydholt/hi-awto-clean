import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function AdminLeadCenter() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const ref = collection(db, "leads");
    const q = query(ref, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snap) => {
      setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const displayed = leads.filter((l) =>
    l.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2>Lead Center</h2>

      <input
        placeholder="Search leads"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {displayed.map((lead) => (
        <div key={lead.id}>
          <strong>{lead.name}</strong> — {lead.email}
        </div>
      ))}
    </div>
  );
}
