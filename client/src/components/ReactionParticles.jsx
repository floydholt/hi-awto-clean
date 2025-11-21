// client/src/components/ReactionParticles.jsx
import React, { useEffect } from "react";

/**
 * Small particle burst animation for reactions.
 * Props:
 * - emoji (string)
 * - onDone() optional
 */
export default function ReactionParticles({ emoji = "❤️", onDone }) {
  useEffect(() => {
    const timeout = setTimeout(() => onDone && onDone(), 800);
    return () => clearTimeout(timeout);
  }, [onDone]);

  // produces 6 particles with small offsets
  const pieces = new Array(6).fill(0).map((_, i) => {
    const left = 50 + (i - 2.5) * 10;
    const delay = i * 40;
    return { i, left, delay };
  });

  return (
    <div className="reaction-particles" aria-hidden>
      {pieces.map((p) => (
        <div
          key={p.i}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}ms`,
          }}
        >
          {emoji}
        </div>
      ))}

      <style jsx="true">{`
        .reaction-particles {
          position: absolute;
          pointer-events: none;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 240px;
          height: 240px;
        }
        .particle {
          position: absolute;
          bottom: 0;
          transform: translateX(-50%);
          font-size: 20px;
          opacity: 0;
          animation: particle-pop 700ms ease-out forwards;
        }
        @keyframes particle-pop {
          0% { transform: translateY(0) scale(.6); opacity: 0;}
          30% { transform: translateY(-30px) scale(1.05); opacity: 1;}
          80% { transform: translateY(-140px) scale(.6); opacity: .7; filter: blur(.2px); }
          100% { transform: translateY(-220px) scale(.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
