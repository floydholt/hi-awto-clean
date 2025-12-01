import { PDFDocument } from "pdf-lib";

/**
 * Encrypt an existing PDF buffer.
 */
export async function encryptPdf(buffer, password) {
  const pdfDoc = await PDFDocument.load(buffer);

  pdfDoc.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: "none",
      copying: false,
      modifying: false,
    },
  });

  return await pdfDoc.save();
}

/**
 * Encrypts AND downloads the PDF directly.
 * Provides backward compatibility for older imports.
 */
export async function downloadEncryptedPdf(buffer, password, filename = "encrypted.pdf") {
  const encrypted = await encryptPdf(buffer, password);

  const blob = new Blob([encrypted], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
