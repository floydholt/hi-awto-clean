import React from "react";

export default function Button({ children, className = "", variant = "primary", ...rest }) {
  let base = "btn ";
  if (variant === "primary") base += "btn-primary ";
  else if (variant === "ghost") base += "btn-ghost ";
  else if (variant === "danger") base += "btn-danger ";

  return (
    <button className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
}
