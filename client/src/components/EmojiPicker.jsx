// client/src/components/EmojiPicker.jsx
import React from "react";

/**
 * Minimal emoji picker used for reactions.
 * Props:
 * - onSelect(emoji)
 * - onClose()
 */
const EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🔥", "⭐", "🎉", "😅"];

export default function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="emoji-picker" role="dialog" aria-modal="true">
      <div className="emoji-grid">
        {EMOJIS.map((e) => (
          <button
            key={e}
            className="emoji-btn"
            onClick={() => {
              onSelect(e);
              onClose();
            }}
            aria-label={`React ${e}`}
          >
            {e}
          </button>
        ))}
      </div>

      <style jsx="true">{`
        .emoji-picker {
          background: white;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }
        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
        }
        .emoji-btn {
          font-size: 20px;
          padding: 8px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .emoji-btn:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
