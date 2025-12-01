// src/utils/encryptPdf.js

/**
 * Encrypt an existing PDF using pdf-lib.
 * Returns Uint8Array (encrypted binary).
 */
export async function encryptPdf(pdfBytes, { userPassword, ownerPassword }) {
  // Load PDF
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Encrypt PDF with user & owner password
  pdfDoc.encrypt({
    userPassword: userPassword,
    ownerPassword: ownerPassword,
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false,
    },
  });

  // Save encrypted PDF
  const encryptedBytes = await pdfDoc.save();
  return encryptedBytes;
}

/**
 * Trigger browser download of encrypted PDF file.
 */
export function downloadEncryptedPdf(filename, uint8Array) {
  const blob = new Blob([uint8Array], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
