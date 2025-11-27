// src/components/FraudReportPanel.jsx
import React from "react";
import {
  exportFraudPdfReport,
  exportProtectedFraudPdfReport,
  exportPublicFraudPdfReport,
} from "../utils/exportFraudPdf.js";
import { exportXlsxWithCharts } from "../utils/exportXlsxWithCharts.js";
import { exportCsv } from "../utils/exportCsv.js";

export default function FraudReportPanel({
  fraudEvents = [],
  listings = [],
  rangeLabel = "",
  listingSeries = [],
  fraudSeries = [],
  userSeries = [],
}) {
  const handleExportPdf = () => {
    exportFraudPdfReport(
      { fraudEvents, listings, rangeLabel },
      `fraud_report_${rangeLabel}.pdf`
    );
  };

  const handleProtectedPdf = () => {
    exportProtectedFraudPdfReport(
      { fraudEvents, listings, rangeLabel },
      `fraud_report_protected_${rangeLabel}.pdf`
    );
  };

  const handlePublicPdf = () => {
    exportPublicFraudPdfReport(
      { fraudEvents, listings, rangeLabel },
      `fraud_report_public_${rangeLabel}.pdf`
    );
  };

  const handleExportCsv = () => {
    const rows = fraudEvents.map((e) => ({
      timestamp: e.timestamp ? new Date(e.timestamp).toISOString() : "",
      listingId: e.listingId,
      score: e.score,
      riskLevel: e.riskLevel,
      // flags & explanation intentionally included in CSV (internal)
      flags: (e.flags || []).join(", "),
      explanation: e.explanation || "",
    }));

    exportCsv(`fraud_events_${rangeLabel}.csv`, rows);
  };

  const handleExportXlsx = () => {
    exportXlsxWithCharts(
      {
        listings,
        users: [], // wire up if you want users here
        fraud: fraudEvents,
        chartSeries: {
          listings: {
            labels: listingSeries.map((x) => x.label),
            values: listingSeries.map((x) => x.count),
          },
          fraud: {
            labels: fraudSeries.map((x) =>
              new Date(x.timestamp).toLocaleDateString()
            ),
            values: fraudSeries.map((x) => x.score),
          },
          users: {
            labels: userSeries.map((x) => x.label),
            values: userSeries.map((x) => x.count),
          },
        },
      },
      `fraud_analytics_${rangeLabel}.xlsx`
    );
  };

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Fraud Reports</h2>
      <p className="text-xs text-slate-500 -mt-2">
        Export internal fraud analytics or share a redacted public summary.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <button
          onClick={handleExportPdf}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          📄 Internal Fraud PDF
        </button>

        <button
          onClick={handleProtectedPdf}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
        >
          🔐 Protected Fraud PDF
        </button>

        <button
          onClick={handlePublicPdf}
          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
        >
          🌐 Public PDF (Redacted)
        </button>

        <button
          onClick={handleExportXlsx}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          📊 XLSX (Sheets + Charts)
        </button>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 sm:col-span-2"
        >
          ⬇ Export Fraud CSV
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-1">
        Public report hides sensitive flags and explanations. Use internal and protected reports for detailed review.
      </p>
    </div>
  );
}
