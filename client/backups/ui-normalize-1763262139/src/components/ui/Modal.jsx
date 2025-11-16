import React from "react";

export default function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow p-6 max-w-xl w-full z-10">
        {title && <h3 className="h2 mb-3">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
}
