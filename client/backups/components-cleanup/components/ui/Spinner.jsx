// client/src/components/ui/Spinner.jsx
import React from "react";

export default function Spinner({ size = 6 }) {
  return (
    <div
      className={`animate-spin border-4 border-gray-300 border-t-brand rounded-full w-${size} h-${size}`}
    />
  );
}
