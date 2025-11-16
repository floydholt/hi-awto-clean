// client/src/components/ui/Textarea.jsx
import React from "react";
import clsx from "clsx";

export default function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={clsx(
        "input",
        "w-full min-h-[120px]",
        className
      )}
      {...props}
    />
  );
}
