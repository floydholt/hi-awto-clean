// src/utils/exportCsv.js

export function exportCsv(filename, rows) {
  if (!rows || rows.length === 0) {
    console.warn("No CSV data");
    return;
  }

  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csvContent = [
    Object.keys(rows[0]).join(","), // header
    ...rows.map((r) => Object.values(r).map(escape).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
