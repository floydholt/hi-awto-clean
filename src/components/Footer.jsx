import React from "react";

export default function Footer() {
  return (
    <footer className="mt-8 py-4 border-t text-center text-sm text-gray-500">
      © {new Date().getFullYear()} HI-AWTO. All rights reserved.
    </footer>
  );
}
