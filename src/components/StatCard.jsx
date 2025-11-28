// src/components/StatCard.jsx

import React from "react";

export default function StatCard({ title, primary, sublabel, detail, accent }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <div className="text-xs text-slate-500 uppercase font-semibold">
        {title}
      </div>

      <div className="text-3xl font-bold text-slate-900 mt-1">
        {primary}
      </div>

      {sublabel && (
        <div
          className={`mt-1 inline-block text-[11px] px-2 py-1 rounded-full ${accent}`}
        >
          {sublabel}
        </div>
      )}

      <div className="text-xs text-slate-500 mt-2">{detail}</div>
    </div>
  );
}
