// src/utils/encryptPdf.js
import { PDFDocument } from "pdf-lib";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";


/**
 * Encrypt a PDF using AES-256 with a user password and optional owner password.
 *
 * @param {Uint8Array} pdfBytes - Raw PDF bytes (from jsPDF)
 * @param {Object} options
 * @param {string} options.userPassword - Password required to open the PDF
 * @param {string} [options.ownerPassword] - Owner password (allows changes)
 * @returns {Promise<Uint8Array>}
 */
export async function encryptPdf(pdfBytes, { userPassword, ownerPassword }) {
  // Load the pdf
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Encrypt using AES-256
  encrypt(pdfDoc, {
    userPassword: userPassword || "",
    ownerPassword: ownerPassword || userPassword || "",
    algorithm: "AES-256",
    permissions: {
      printing: "none",
      modifying: false,
      copying: false,
      annotating: false,
    },
  });

  const encryptedBytes = await pdfDoc.save();
  return encryptedBytes;
}

/**
 * Trigger download in browser.
 */
export function downloadEncryptedPdf(fileName, encryptedBytes) {
  const blob = new Blob([encryptedBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}
