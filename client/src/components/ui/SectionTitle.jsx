// client/src/components/ui/SectionTitle.jsx
import React from "react";

export default function SectionTitle({ children }) {
  return (
    <h2 className="text-xl font-semibold mb-4 text-brand-dark dark:text-brand-light">
      {children}
    </h2>
  );
}
