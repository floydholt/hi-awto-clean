// =====================================================================
// functions/src/index.ts
// Root export file for Cloud Functions
// =====================================================================

import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

import { generateAITags } from "./aiVision.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
import { generateAIDescription } from "./aiDescription.js";
import { generateListingBrochure } from "./brochure.js";

// Import admin role sync trigger from admin.ts
import { onUserRoleWrite } from "./admin.js";

// --------------------------------------------------------------
// SAFE INITIALIZATION
// --------------------------------------------------------------
if (!admin.apps.length) {
  admin.initializeApp();
}

// --------------------------------------------------------------
// LISTING PROCESSOR TRIGGER
// --------------------------------------------------------------

export const processListing = onDocumentWritten(
  { document: "listings/{id}", region: "us-central1" },
  async (event) => {
    const listingId = event.params.id;
    const after = event.data?.after?.data();

    if (!after) return;

    console.log("Processing listing:", listingId);

    try {
      // 1. Vision
      const vision = await generateAITags(after.imageUrls || []);

      // 2. Pricing
      const pricing = await generateAIPricing({
        title: after.title || "",
        description: after.description || "",
        beds: Number(after.beds) || 0,
        baths: Number(after.baths) || 0,
        sqft: Number(after.sqft) || 0,
        zip: after.zip || "",
        price: Number(after.price) || 0,
      });

      // 3. Fraud
      const fraud = await runFraudCheck(after);

      // 4. Description
      const description = await generateAIDescription({
        title: after.title || "",
        address: after.address || "",
        beds: Number(after.beds) || 0,
        baths: Number(after.baths) || 0,
        sqft: Number(after.sqft) || 0,
        description: after.description || "",
        aiTags: vision.tags || [],
      });

      // SAVE RESULTS
      await admin.firestore().collection("listings")
        .doc(listingId)
        .update({
          aiTags: vision.tags,
          aiCaption: vision.caption,
          aiPricing: pricing,
          aiFraud: fraud,
          aiFullDescription: description,
          aiUpdatedAt: new Date().toISOString(),
        });

      console.log("AI fields updated for listing:", listingId);
    } catch (err) {
      console.error("AI processing failed:", listingId, err);
    }
  }
);

// --------------------------------------------------------------
// BROCHURE GENERATOR (Callable)
// --------------------------------------------------------------

export const createListingBrochure = onCall(
  { region: "us-central1", timeoutSeconds: 300 },
  async (request) => {
    const listingId = request.data?.listingId;

    if (!listingId || typeof listingId !== "string") {
      throw new Error("listingId is required");
    }

    const storagePath = await generateListingBrochure(listingId);
    return { storagePath };
  }
);

// --------------------------------------------------------------
// ADMIN FUNCTIONS EXPORT
// --------------------------------------------------------------

export { onUserRoleWrite };
export { reviewListing } from "./adminActions.js";
