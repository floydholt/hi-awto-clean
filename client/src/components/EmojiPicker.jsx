// client/src/components/EmojiPicker.jsx
import React from "react";

/**
 * Tiny emoji picker. Stateless.
 * Props:
 *  - onSelect(emoji)
 *  - recent = [] (optional)
 */
const DEFAULT_EMOJI = ["👍", "❤️", "😂", "😍", "👏", "🔥", "🎉", "😮", "😢", "🤝"];

export default function EmojiPicker({ onSelect, recent = [] }) {
  const list = [...new Set([...(recent || []), ...DEFAULT_EMOJI])];

  return (
    <div className="bg-white shadow-md rounded p-2 grid grid-cols-5 gap-2">
      {list.map((e) => (
        <button
          key={e}
          onClick={() => onSelect(e)}
          className="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100"
          aria-label={`React with ${e}`}
          type="button"
        >
          <span style={{ fontSize: 18 }}>{e}</span>
        </button>
      ))}
    </div>
  );
}
