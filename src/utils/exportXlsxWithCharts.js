// src/utils/exportXlsxWithCharts.js
import XLSX from "xlsx";
import XlsxPopulate from "xlsx-populate";

/* ------------------------------------------------------
   BANNER LOADER
------------------------------------------------------ */
async function loadBannerBase64() {
  const res = await fetch("/excel-banner.png");
  const blob = await res.blob();
  const buf = await blob.arrayBuffer();
  return Buffer.from(buf).toString("base64");
}

/* ------------------------------------------------------
   WATERMARK GENERATOR (CANVAS)
------------------------------------------------------ */
async function generateWatermarkPng(text, color = "rgba(0,0,0,0.15)") {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1000;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 1000, 1000);

  ctx.font = "bold 70px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.16;

  ctx.translate(500, 500);
  ctx.rotate((-35 * Math.PI) / 180);
  ctx.fillText(text, 0, 0);

  return canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
}

/* ------------------------------------------------------
   AUTOFIT HELPER
------------------------------------------------------ */
function autoFitColumns(jsonRows) {
  const widths = [];
  jsonRows.forEach((row) => {
    Object.values(row).forEach((v, idx) => {
      const w = String(v ?? "").length + 4;
      widths[idx] = widths[idx] ? Math.max(widths[idx], w) : w;
    });
  });
  return widths.map((w) => ({ wch: w }));
}

/* ------------------------------------------------------
   MAIN EXPORT FUNCTION
------------------------------------------------------ */
export async function exportXlsxWithCharts(data, filename = "analytics.xlsx") {
  /* FRAUD-BASED WATERMARK LOGIC */
  const mostRecentFraud = data.fraud?.[data.fraud.length - 1];

  let watermarkText = "HI-AWTO INTERNAL — DO NOT DISTRIBUTE";
  let wmColor = "rgba(0,0,0,0.2)";

  if (mostRecentFraud?.riskLevel === "high") {
    watermarkText = "CONFIDENTIAL — HIGH FRAUD RISK";
    wmColor = "rgba(220,30,30,0.25)";
  } else if (mostRecentFraud?.riskLevel === "medium") {
    watermarkText = "INTERNAL USE ONLY";
    wmColor = "rgba(255,165,0,0.22)";
  }

  const watermarkBase64 = await generateWatermarkPng(watermarkText, wmColor);
  const watermarkBuffer = Buffer.from(watermarkBase64, "base64");

  const bannerBase64 = await loadBannerBase64();
  const bannerBuffer = Buffer.from(bannerBase64, "base64");

  /* ------------------------------------------------------
     CREATE WORKBOOK (SheetJS)
  ------------------------------------------------------ */
  const wb = XLSX.utils.book_new();

  // LISTINGS SHEET
  const listingsSheet = XLSX.utils.json_to_sheet(data.listings);
  listingsSheet["!cols"] = autoFitColumns(data.listings);
  XLSX.utils.book_append_sheet(wb, listingsSheet, "Listings");

  // USERS SHEET
  const usersSheet = XLSX.utils.json_to_sheet(data.users);
  usersSheet["!cols"] = autoFitColumns(data.users);
  XLSX.utils.book_append_sheet(wb, usersSheet, "Users");

  // FRAUD SHEET
  const fraudSheet = XLSX.utils.json_to_sheet(data.fraud);
  fraudSheet["!cols"] = autoFitColumns(data.fraud);
  XLSX.utils.book_append_sheet(wb, fraudSheet, "Fraud");

  // SUMMARY SHEET
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["HI AWTO — Admin Analytics Summary"],
    [
      `Last Fraud Status: ${
        mostRecentFraud ? mostRecentFraud.riskLevel.toUpperCase() : "Unknown"
      }`,
    ],
    ["Generated:", new Date().toLocaleString()],
  ]);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  /* ------------------------------------------------------
     NEW: ONE FRAUD-SIGNATURE SHEET PER LISTING
  ------------------------------------------------------ */
  for (const listing of data.listings) {
    const fraud = data.fraud.find((f) => f.listingId === listing.id);

    const rows = [
      ["Listing ID", listing.id],
      ["Title", listing.title],
      ["Address", listing.address],
      ["Price", listing.price ?? ""],
      ["Beds", listing.beds],
      ["Baths", listing.baths],
      ["Square Feet", listing.sqft],
      [],
      ["--- AI FRAUD SIGNATURE ---"],
      ["Risk Score", fraud?.score ?? "—"],
      ["Risk Level", fraud?.riskLevel ?? "—"],
      ["Flags", fraud?.flags?.join(", ") ?? "—"],
      ["Explanation", fraud?.explanation ?? "—"],
      ["Timestamp", fraud?.timestamp ? new Date(fraud.timestamp).toISOString() : "—"],
      [],
      ["Generated:", new Date().toISOString()],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = autoFitColumns(
      rows.map((r) => ({
        col1: r[0],
        col2: r[1],
      }))
    );

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `LISTING-${listing.id.substring(0, 20)}`
    );
  }

  /* ------------------------------------------------------
     EXPORT BASE64 → Inject graphics with XlsxPopulate
  ------------------------------------------------------ */
  const base64 = XLSX.write(wb, { type: "base64" });

  const workbook = await XlsxPopulate.fromDataAsync(Buffer.from(base64, "base64"));

  for (const sheet of workbook.sheets()) {
    /* Banner */
    sheet.addImage({
      image: bannerBuffer,
      type: "picture",
      position: {
        type: "twoCellAnchor",
        from: { row: 1, col: 1 },
        to: { row: 6, col: 12 },
      },
    });

    /* Watermark */
    sheet.addImage({
      image: watermarkBuffer,
      type: "picture",
      position: {
        type: "twoCellAnchor",
        from: { row: 8, col: 2 },
        to: { row: 30, col: 12 },
      },
    });

    /* Gemini footer */
    const last = sheet.usedRange()._maxRowNumber + 3;
    sheet.cell(last, 1).value(
      `Powered by Gemini AI — Generated ${new Date().toLocaleString()}`
    );
    sheet.range(last, 1, last, 10).merged(true).style({
      italic: true,
      fontColor: "888",
      horizontalAlignment: "center",
    });
  }

  /* ------------------------------------------------------
     DOWNLOAD XLSX
  ------------------------------------------------------ */
  const out = await workbook.outputAsync();
  const blob = new Blob([out], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
