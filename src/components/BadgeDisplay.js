// src/components/BadgeDisplay.js
import React from 'react';

export default function BadgeDisplay({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="badge-display">
      {badges.map((badge, i) => (
        <span key={i} className="badge">
          {badge}
        </span>
      ))}
    </div>
  );
}
