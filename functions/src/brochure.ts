import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import PDFDocument from "pdfkit";

// Ensure Admin SDK is initialized exactly once
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();
const bucket = getStorage().bucket();

interface BrochureInput {
  title: string;
  address: string;
  price?: number;
  downPayment?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  description: string;
  tags: string[];
  imageUrl?: string;
}

/**
 * Generate and upload an MLS-style PDF brochure for a listing.
 * Returns the Storage path, e.g. "brochures/<listingId>.pdf".
 */
export async function generateListingBrochure(
  listingId: string
): Promise<string> {
  const snap = await db.collection("listings").doc(listingId).get();

  if (!snap.exists) {
    throw new Error(`Listing ${listingId} not found`);
  }

  const data = snap.data() as any;

  const {
    title = "Untitled Listing",
    address = "",
    price,
    downPayment,
    beds,
    baths,
    sqft,
    aiFullDescription,
    description,
    aiTags,
    imageUrls,
  } = data || {};

  const mainImageUrl: string | undefined =
    Array.isArray(imageUrls) && imageUrls.length ? imageUrls[0] : undefined;

  const brochureInput: BrochureInput = {
    title,
    address,
    price: typeof price === "number" ? price : undefined,
    downPayment:
      typeof downPayment === "number" ? downPayment : undefined,
    beds: typeof beds === "number" ? beds : undefined,
    baths: typeof baths === "number" ? baths : undefined,
    sqft: typeof sqft === "number" ? sqft : undefined,
    description: aiFullDescription || description || "",
    tags: Array.isArray(aiTags) ? aiTags : [],
    imageUrl: mainImageUrl,
  };

  const pdfBuffer = await createBrochurePdf(brochureInput);

  const storagePath = `brochures/${listingId}.pdf`;
  const file = bucket.file(storagePath);

  await file.save(pdfBuffer, {
    contentType: "application/pdf",
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=3600",
    },
  });

  return storagePath;
}

async function createBrochurePdf(input: BrochureInput): Promise<Buffer> {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // HEADER BRANDING
      doc
        .fontSize(20)
        .fillColor("#111111")
        .text("HI AWTO", { align: "right" })
        .moveDown(0.5);

      // TITLE + ADDRESS
      doc
        .fontSize(24)
        .fillColor("#111111")
        .text(input.title || "Untitled Listing", {
          align: "left",
        });

      if (input.address) {
        doc
          .moveDown(0.25)
          .fontSize(12)
          .fillColor("#555555")
          .text(input.address);
      }

      // PRICE + STATS
      doc.moveDown(0.5);

      const priceLine: string[] = [];

      if (typeof input.price === "number" && !Number.isNaN(input.price)) {
        priceLine.push(
          `$${input.price.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}`
        );
      }

      if (typeof input.beds === "number") priceLine.push(`${input.beds} bd`);
      if (typeof input.baths === "number") priceLine.push(`${input.baths} ba`);

      if (typeof input.sqft === "number") {
        priceLine.push(
          `${input.sqft.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })} sq ft`
        );
      }

      if (priceLine.length) {
        doc
          .fontSize(16)
          .fillColor("#1d4ed8")
          .text(priceLine.join("  •  "));
      }

      if (typeof input.downPayment === "number") {
        doc
          .moveDown(0.15)
          .fontSize(10)
          .fillColor("#16a34a")
          .text(
            `Approx. $${input.downPayment.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} down (estimate)`
          );
      }

      // MAIN PHOTO (if we have one)
      if (input.imageUrl) {
        try {
          const res = await fetch(input.imageUrl);
          const arrayBuffer = await res.arrayBuffer();
          const imgBuffer = Buffer.from(arrayBuffer);

          doc.moveDown(0.5);
          const pageWidth =
            doc.page.width -
            doc.page.margins.left -
            doc.page.margins.right;

          doc.image(imgBuffer, {
            fit: [pageWidth, 260],
            align: "center",
            valign: "center",
          });
        } catch (err) {
          console.error("Brochure: failed to embed image", err);
        }
      }

      doc.moveDown(0.75);

      // DESCRIPTION SECTION
      if (input.description) {
        doc
          .fontSize(14)
          .fillColor("#111111")
          .text("Property Overview", { underline: true });

        doc.moveDown(0.25);
        doc
          .fontSize(11)
          .fillColor("#333333")
          .text(input.description, {
            align: "left",
          });
      }

      // HIGHLIGHTS (TAGS)
      const tags = input.tags.slice(0, 16);
      if (tags.length) {
        doc.moveDown(0.75);
        doc
          .fontSize(14)
          .fillColor("#111111")
          .text("Highlights", { underline: true });

        doc.moveDown(0.25);
        doc
          .fontSize(11)
          .fillColor("#333333")
          .text(tags.map((t) => `• ${t}`).join("\n"));
      }

      // FOOTER DISCLAIMER
      doc.moveDown(1);
      doc
        .fontSize(8)
        .fillColor("#9ca3af")
        .text(
          "This brochure was auto-generated by HI AWTO from listing data and AI-assisted descriptions. Not a legal disclosure or appraisal.",
          {
            align: "left",
          }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
