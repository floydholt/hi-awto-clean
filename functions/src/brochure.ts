// src/brochure.ts
import { storage, db } from "./admin.js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateListingBrochure(listingId: string): Promise<string> {
  const snap = await db.collection("listings").doc(listingId).get();
  if (!snap.exists) {
    throw new Error(`Listing ${listingId} not found`);
  }
  const listing = snap.data() || {};

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter

  const { width, height } = page.getSize();

  const fontTitle = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontBody = await doc.embedFont(StandardFonts.Helvetica);

  // Header bar
  page.drawRectangle({
    x: 0,
    y: height - 60,
    width,
    height: 60,
    color: rgb(0.15, 0.33, 0.71)
  });

  page.drawText("HI-AWTO · MLS Brochure", {
    x: 40,
    y: height - 40,
    size: 18,
    font: fontTitle,
    color: rgb(1, 1, 1)
  });

  // Basic info
  const title = String(listing.title || "Untitled Listing");
  const address = String(listing.address || "Address not provided");
  const price = listing.price ? `$${Number(listing.price).toLocaleString()}` : "Price TBD";
  const beds = listing.beds ?? listing.bedrooms ?? "—";
  const baths = listing.baths ?? listing.bathrooms ?? "—";
  const sqft = listing.sqft ?? "—";

  let y = height - 100;

  page.drawText(title, {
    x: 40,
    y,
    size: 18,
    font: fontTitle,
    color: rgb(0.1, 0.1, 0.1)
  });
  y -= 24;

  page.drawText(address, {
    x: 40,
    y,
    size: 12,
    font: fontBody,
    color: rgb(0.25, 0.25, 0.3)
  });
  y -= 24;

  page.drawText(`Price: ${price}`, {
    x: 40,
    y,
    size: 12,
    font: fontBody
  });
  y -= 18;

  page.drawText(`Beds: ${beds}  |  Baths: ${baths}  |  SqFt: ${sqft}`, {
    x: 40,
    y,
    size: 11,
    font: fontBody
  });
  y -= 32;

  const aiDesc: string =
    typeof listing.aiFullDescription === "string"
      ? listing.aiFullDescription
      : String(listing.description || "");

  const wrapped = wrapText(aiDesc, 80);
  for (const line of wrapped) {
    if (y < 60) break;
    page.drawText(line, {
      x: 40,
      y,
      size: 10,
      font: fontBody,
      color: rgb(0.2, 0.2, 0.25)
    });
    y -= 14;
  }

  const pdfBytes = await doc.save();

  const bucket = storage.bucket();
  const filePath = `brochures/${listingId}.pdf`;
  const file = bucket.file(filePath);

  await file.save(Buffer.from(pdfBytes), {
    contentType: "application/pdf"
  });

  return filePath;
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = w;
    } else {
      current += " " + w;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}
