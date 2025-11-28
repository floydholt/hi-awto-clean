// src/utils/exportXlsxWithCharts.js
import * as XLSX from "xlsx";

/* ------------------------------------------------------
   Export XLSX with embedded chart images (browser safe)
------------------------------------------------------- */

export async function exportXlsxWithCharts(data, fileName = "analytics_report.xlsx") {
  const { listings, users, fraud, chartSeries } = data;

  const wb = XLSX.utils.book_new();

  /* ------------------------------ */
  /*  SHEET 1: Listings             */
  /* ------------------------------ */
  const listingRows = listings.map((l) => ({
    ID: l.id,
    Title: l.title || "—",
    Address: l.address || "—",
    Price: l.price || "—",
    Status: l.status || "—",
    Tags: (l.aiTags || []).join(", "),
  }));
  const wsListings = XLSX.utils.json_to_sheet(listingRows);
  XLSX.utils.book_append_sheet(wb, wsListings, "Listings");

  /* ------------------------------ */
  /*  SHEET 2: Users                */
  /* ------------------------------ */
  const userRows = users.map((u) => ({
    ID: u.id,
    Name: u.displayName || "—",
    Email: u.email || "—",
    Role: u.role || "user",
    Joined:
      u.createdAt?.toDate?.().toLocaleDateString?.() ||
      u.createdAt?.toLocaleDateString?.() ||
      "—",
  }));
  const wsUsers = XLSX.utils.json_to_sheet(userRows);
  XLSX.utils.book_append_sheet(wb, wsUsers, "Users");

  /* ------------------------------ */
  /*  SHEET 3: Fraud Events         */
  /* ------------------------------ */
  const fraudRows = fraud.map((f) => ({
    Timestamp: f.timestamp ? new Date(f.timestamp).toLocaleString() : "—",
    Score: f.score,
    Risk: f.riskLevel,
    Flags: (f.flags || []).join(", "),
  }));
  const wsFraud = XLSX.utils.json_to_sheet(fraudRows);
  XLSX.utils.book_append_sheet(wb, wsFraud, "FraudEvents");

  /* ------------------------------ */
  /*  EMBED CHART IMAGES            */
  /* ------------------------------ */
  if (chartSeries?.listings?.chartImage) {
    wsListings["!images"] = wsListings["!images"] || [];
    wsListings["!images"].push({
      name: "ListingsChart",
      data: chartSeries.listings.chartImage.split(",")[1],
      extension: "png",
      tl: { col: 7, row: 1 },
      br: { col: 13, row: 20 },
    });
  }

  if (chartSeries?.fraud?.chartImage) {
    wsFraud["!images"] = wsFraud["!images"] || [];
    wsFraud["!images"].push({
      name: "FraudChart",
      data: chartSeries.fraud.chartImage.split(",")[1],
      extension: "png",
      tl: { col: 7, row: 1 },
      br: { col: 13, row: 20 },
    });
  }

  /* ------------------------------ */
  /*     EXPORT                     */
  /* ------------------------------ */

  const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
