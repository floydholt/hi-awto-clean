import { onDocumentWritten, type FirestoreEvent } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { doc, updateDoc } from "firebase/firestore";
import { generateListingBrochure } from "./brochure.js";
import { generateAITags } from "./aiVision.js";
import { generatePricing } from "./aiPricing.js";
import { assessFraud } from "./aiFraud.js";
import { generateDescription } from "./aiDescription.js";
import { db } from "./firebase.js"; // assumes you export Firestore instance here

/**
 * Firestore trigger to process listing AI modules
 */
export const processListing = onDocumentWritten(
  "listings/{id}",
  async (event: FirestoreEvent<any>) => {
    const after = event.data?.after?.data();
    const listingId = event.params.id;

    if (!after) return;

    console.log("Processing listing:", listingId);

    try {
      const vision = await generateAITags(after.imageUrls || []);
      const pricing = await generatePricing({
        address: after.address,
        sqft: after.sqft,
        bedrooms: after.bedrooms,
        bathrooms: after.bathrooms,
        recentSales: after.recentSales || [],
      });
      const fraud = await assessFraud(after);
      const description = await generateDescription({
        title: after.title,
        address: after.address,
        price: after.price,
        features: after.features || [],
        notes: after.description || "",
      });

      await updateDoc(doc(db, "listings", listingId), {
        aiTags: vision.tags,
        aiCaption: vision.caption,
        aiPricing: pricing,
        aiFraud: fraud,
        aiFullDescription: description,
        aiUpdatedAt: new Date().toISOString(),
      });

      console.log("AI fields updated for listing:", listingId);
    } catch (err) {
      console.error("AI processing failed for listing:", listingId, err);
    }
  }
);

/**
 * Callable function to generate an MLS-style PDF brochure
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
