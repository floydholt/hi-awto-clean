// src/utils/exportXlsx.js
import * as XLSX from "xlsx";

/**
 * Convert array of objects to XLSX and trigger download.
 * @param {string} filename - Example: "analytics.xlsx"
 * @param {Array<Object>} rows - table data
 */
export function exportXlsx(filename, rows) {
  if (!rows || rows.length === 0) {
    console.warn("exportXlsx: No rows provided.");
    return;
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const columnWidths = [];
  const headers = Object.keys(rows[0]);

  headers.forEach((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((row) => (row[key] ? String(row[key]).length : 0))
    );

    columnWidths.push({ wch: maxLen + 2 });
  });

  worksheet["!cols"] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // Write file
  XLSX.writeFile(workbook, filename);
}
