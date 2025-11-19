// client/src/components/ReactionParticles.jsx
import React from "react";

/**
 * ReactionParticles
 * Renders absolute-positioned SVGs / shapes depending on particle.type:
 *   - "heart"
 *   - "star"
 *   - "confetti"
 *   - "circle"
 *   - "spark"
 *   - "tear"
 */
export default function ReactionParticles({ particles = [] }) {
  return (
    <div aria-hidden className="reaction-particles-root pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`rp-particle rp-${p.type}`}
          style={{
            left: `${p.left}px`,
            top: `${p.top}px`,
            transform: `translate(-50%,-50%) scale(${p.scale ?? 1})`,
            animationDelay: `${p.delay ?? 0}ms`,
            ["--rp-color"]: p.color || "#ff4d6d",
          }}
        >
          {renderParticleSVG(p.type)}
        </div>
      ))}
    </div>
  );
}

/** Returns an SVG appropriate for the particle type */
function renderParticleSVG(type) {
  switch (type) {
    case "heart":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            d="M12 21s-7.5-4.9-9.1-7.1C.9 10.8 3.3 6 8 6c2.2 0 3.4 1.1 4 2.1.6-1 1.8-2.1 4-2.1 4.7 0 7.1 4.8 5.1 7.9C19.5 16.1 12 21 12 21z"
            fill="var(--rp-color)"
          />
        </svg>
      );

    case "star":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24">
          <path
            d="M12 2l3.1 6.3L22 9.3l-5 4.8L18.2 22 12 18.4 5.8 22 7 14.1 2 9.3l6.9-1z"
            fill="var(--rp-color)"
          />
        </svg>
      );

    case "confetti":
      return (
        <svg width="10" height="10" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="5" fill="var(--rp-color)" />
        </svg>
      );

    case "circle":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="6" fill="var(--rp-color)" />
        </svg>
      );

    case "spark":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path
            d="M12 2l2 6h6l-5 3.5L17 20l-5-3-5 3 2-8.5L4 8h6z"
            fill="var(--rp-color)"
          />
        </svg>
      );

    case "tear":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path
            d="M12 2c3 4 6 7 6 11a6 6 0 11-12 0c0-4 3-7 6-11z"
            fill="var(--rp-color)"
          />
        </svg>
      );

    default:
      return null;
  }
}
