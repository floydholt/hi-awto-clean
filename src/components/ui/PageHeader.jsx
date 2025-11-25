// client/src/components/ui/PageHeader.jsx
import React from "react";

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-display font-bold">{title}</h1>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
