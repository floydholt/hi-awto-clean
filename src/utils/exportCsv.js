// src/utils/exportCsv.js

/**
 * Convert an array of objects into CSV text.
 */
function toCsv(rows) {
  if (!rows || rows.length === 0) return "";

  const headers = Object.keys(rows[0]);

  const escape = (value) => {
    if (value == null) return "";
    const str = String(value);
    // Escape quotes by doubling them
    if (str.includes('"') || str.includes(",") || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = [
    headers.join(","), // header row
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");

  return csv;
}

/**
 * Trigger browser download of CSV file.
 */
export function exportCsv(filename, rows) {
  const csv = toCsv(rows);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // Create a temporary link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(link.href);
}
