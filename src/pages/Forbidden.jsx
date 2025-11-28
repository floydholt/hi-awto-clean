import React from "react";
import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="max-w-lg mx-auto text-center py-20">
      <h1 className="text-3xl font-bold text-red-600 mb-3">403 Forbidden</h1>
      <p className="text-slate-600 mb-6">
        You do not have permission to access this page.
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}
