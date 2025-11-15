// client/src/components/ui/Modal.jsx
import React from "react";
import Button from "./Button";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            className="text-2xl hover:text-danger"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div>{children}</div>

        <div className="text-right mt-6">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
