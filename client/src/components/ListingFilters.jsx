// client/src/components/ListingFilters.jsx
import React, { useState } from "react";

export default function ListingFilters({ onApply }) {
  const [city, setCity] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [q, setQ] = useState("");

  const apply = () => {
    onApply({ city: city.trim(), min: min ? Number(min) : null, max: max ? Number(max) : null, q: q.trim() });
  };

  const reset = () => {
    setCity(""); setMin(""); setMax(""); setQ("");
    onApply({ city: "", min: null, max: null, q: "" });
  };

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input className="input" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
        <input className="input" placeholder="Min price" value={min} onChange={e=>setMin(e.target.value)} />
        <input className="input" placeholder="Max price" value={max} onChange={e=>setMax(e.target.value)} />
        <input className="input" placeholder="Search (title/address)" value={q} onChange={e=>setQ(e.target.value)} />
        <div style={{ display:"flex", gap:8 }}>
          <button className="button" onClick={apply}>Apply</button>
          <button className="button" style={{ background:"#666" }} onClick={reset}>Reset</button>
        </div>
      </div>
    </div>
  );
}
