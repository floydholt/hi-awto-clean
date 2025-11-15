// client/src/components/ui/Button.jsx
import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  className = "",
  variant = "brand",
  size = "md",
  ...props
}) {
  const base = "rounded-lg font-medium transition-all duration-200";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-5 py-3 text-lg",
  };

  const variants = {
    brand: "bg-brand text-white hover:bg-brand-dark",
    light:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    danger: "bg-danger text-white hover:bg-danger-dark",
    outline:
      "border border-brand text-brand bg-transparent hover:bg-brand hover:text-white",
  };

  return (
    <button
      className={clsx(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
