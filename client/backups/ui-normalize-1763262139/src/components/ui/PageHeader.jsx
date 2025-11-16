import React from "react";

export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        {subtitle && <div className="kicker">{subtitle}</div>}
        <h1 className="h1">{title}</h1>
      </div>
      <div>{right}</div>
    </div>
  );
}
