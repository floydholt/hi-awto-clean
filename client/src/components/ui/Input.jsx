// client/src/components/ui/Input.jsx
import React from "react";
import clsx from "clsx";

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={clsx(
        "input",
        "w-full",
        className
      )}
      {...props}
    />
  );
}
