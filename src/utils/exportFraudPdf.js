// src/utils/exportFraudPdf.js
import { jsPDF } from "jspdf";

/**
 * Generates a PDF report for a fraud event.
 * @param {Object} event - The fraud event data.
 */
export function exportFraudPdf(event) {
  const doc = new jsPDF();

  const title = "Fraud Detection Report";
  const lineY = 20;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, 14, lineY);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);

  const rows = [
    ["Listing ID:", event.listingId ?? "—"],
    ["Score:", event.score ?? "—"],
    ["Risk Level:", getRiskLevel(event.score)],
    ["Timestamp:", formatTime(event.createdAt)],
  ];

  let y = lineY + 15;

  rows.forEach(([label, value]) => {
    doc.setFont("Helvetica", "bold");
    doc.text(label, 14, y);

    doc.setFont("Helvetica", "normal");
    doc.text(String(value), 60, y);

    y += 8;
  });

  // Details JSON block
  doc.setFont("Helvetica", "bold");
  doc.text("Details:", 14, y + 4);

  doc.setFont("Helvetica", "normal");
  const json = JSON.stringify(event.details || event, null, 2);
  const wrapped = doc.splitTextToSize(json, 180);

  doc.text(wrapped, 14, y + 12);

  doc.save("fraud-report.pdf");
}

/**
 * Backwards-compatible aliases — prevents ALL legacy import errors
 * Any old name used anywhere in your code will now work safely.
 */
export const exportFraudPdfReport = exportFraudPdf;
export const exportProtectedFraudPdfReport = exportFraudPdf;
export const exportPublicFraudPdfReport = exportFraudPdf;

// If you ever find another old import, you can alias it here:
export const exportPdfFraudReport = exportFraudPdf;         // optional future alias
export const downloadFraudPdfReport = exportFraudPdf;       // optional future alias

/* Utility functions */
function getRiskLevel(score) {
  if (score == null) return "Unknown";
  if (score >= 80) return "High Risk";
  if (score >= 50) return "Medium Risk";
  return "Low Risk";
}

function formatTime(ts) {
  if (!ts) return "—";
  if (ts.toDate) return ts.toDate().toLocaleString();
  return new Date(ts).toLocaleString();
}
