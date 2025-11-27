import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { generateListingBrochure } from "./brochure.js";

/**
 * Firestore trigger placeholder for future AI processing.
 * Currently just logs; you can wire your AI modules in here.
 */
export const processListing = onDocumentWritten(
  "listings/{id}",
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    console.log("Listing written: ", event.params.id, after.title);
    // TODO: call AI vision / pricing / fraud here if desired.
  }
);

/**
 * Callable function to generate an MLS-style PDF brochure
 * for a given listing ID and store it in Cloud Storage.
 *
 * Client calls this with: { listingId }
 * and receives: { storagePath }
 */
export const createListingBrochure = onCall(
  { region: "us-central1", timeoutSeconds: 300 },
  async (request) => {
    const data = (request.data || {}) as { listingId?: string };
    const listingId = data.listingId;

    if (!listingId || typeof listingId !== "string") {
      throw new Error("listingId is required");
    }

    const storagePath = await generateListingBrochure(listingId);
    return { storagePath };
  }
);
