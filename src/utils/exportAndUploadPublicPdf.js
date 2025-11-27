// src/utils/exportAndUploadPublicPdf.js
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { exportPublicFraudPdfReport } from "./exportFraudPdf.js";
import { generatePublicPdfShareLink } from "../utils/exportAndUploadPublicPdf.js";

const handleSharePublicPdf = async () => {
  try {
    const { url } = await generatePublicPdfShareLink(
      { fraudEvents, listings, rangeLabel },
      `fraud_report_public_${rangeLabel}.pdf`
    );

    // Copy to clipboard
    await navigator.clipboard.writeText(url);
    alert("Public PDF link copied to clipboard:\n\n" + url);
  } catch (err) {
    console.error("Error generating share link:", err);
    alert("Failed to generate public share link.");
  }
};

<button
  onClick={handleSharePublicPdf}
  className="px-4 py-2 bg-emerald-700 text-white text-sm rounded-lg hover:bg-emerald-800"
>
  🔗 Share Public PDF Link
</button>


/**
 * Generate **Public Redacted Fraud PDF** and upload to Firebase Storage.
 *
 * Returns: { url: string }
 */
export async function generatePublicPdfShareLink(
  data,
  fileName = "fraud_report_public.pdf"
) {
  try {
    // 1. Generate ArrayBuffer for the public PDF
    const doc = await exportPublicFraudPdfReport(data, null);
    const pdfBytes =
      doc instanceof ArrayBuffer ? doc : doc.output("arraybuffer");

    // 2. Upload to Firebase Storage
    const storage = getStorage();
    const path = `publicReports/${Date.now()}_${fileName}`;
    const fileRef = ref(storage, path);

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    await uploadBytes(fileRef, blob);

    // 3. Fetch public download URL
    const url = await getDownloadURL(fileRef);

    return { url };
  } catch (err) {
    console.error("Public PDF upload error:", err);
    throw err;
  }
}
