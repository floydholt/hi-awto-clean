// src/components/KpiGrid.jsx
import React from "react";
import "./KpiGrid.css"; // optional styling file

export default function KpiGrid({ metrics }) {
  return (
    <div className="kpi-grid">
      {metrics.map((m) => (
        <div key={m.label} className="kpi-card">
          <h3 className="kpi-label">{m.label}</h3>
          <p className="kpi-value">{m.value}</p>
        </div>
      ))}
    </div>
  );
}
