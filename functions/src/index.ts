// src/index.ts
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

import { db, auth } from "./admin.js";
import { generateAITags } from "./aiVision.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
import { generateAIDescription } from "./aiDescription.js";
import { recordFraudEvent } from "./aiFraudAnalytics.js";
import { generateListingBrochure } from "./brochure.js";

// ================================================================
// LISTING PROCESSOR TRIGGER
// ================================================================
export const processListing = onDocumentWritten(
  { document: "listings/{id}", region: "us-central1" },
  async (event) => {
    const listingId = event.params.id as string;
    const afterSnap = event.data?.after;

    if (!afterSnap || !afterSnap.exists) {
      logger.info("Listing deleted, skipping AI processing", { listingId });
      return;
    }

    const after = afterSnap.data() as any;
    logger.info("Processing listing with AI", { listingId });

    try {
      const vision = await generateAITags(after.imageUrls || []);

      const pricing = await generateAIPricing({
        title: after.title ?? "",
        description: after.description ?? "",
        beds: Number(after.beds ?? after.bedrooms ?? 0),
        baths: Number(after.baths ?? after.bathrooms ?? 0),
        sqft: Number(after.sqft ?? 0),
        zip: String(after.zip || ""),
        price: Number(after.price ?? 0)
      });

      const fraud = await runFraudCheck(after);

      const fullDescription = await generateAIDescription({
        title: after.title ?? "",
        address: after.address ?? "",
        beds: Number(after.beds ?? after.bedrooms ?? 0),
        baths: Number(after.baths ?? after.bathrooms ?? 0),
        sqft: Number(after.sqft ?? 0),
        description: after.description ?? "",
        aiTags: vision.tags || []
      });

      await db.collection("listings").doc(listingId).update({
        aiTags: vision.tags,
        aiCaption: vision.caption,
        aiPricing: pricing,
        aiFraud: fraud,
        aiFullDescription: fullDescription,
        aiUpdatedAt: new Date().toISOString()
      });

      await recordFraudEvent(listingId, fraud);

      logger.info("AI fields updated for listing", { listingId });
    } catch (err) {
      logger.error("AI processing failed for listing", {
        listingId,
        error: (err as Error).message
      });
    }
  }
);

// ================================================================
// USER ROLE -> AUTH CLAIMS SYNC
// ================================================================
export const onUserRoleWrite = onDocumentWritten(
  { document: "users/{uid}", region: "us-central1" },
  async (event) => {
    const uid = event.params.uid as string;
    const afterSnap = event.data?.after;

    if (!afterSnap || !afterSnap.exists) {
      logger.info("User doc deleted, clearing admin claim", { uid });
      await auth.setCustomUserClaims(uid, { admin: false });
      return;
    }

    const data = afterSnap.data() as { role?: string } | undefined;
    const role = data?.role || "user";
    const isAdmin = role === "admin";

    try {
      await auth.setCustomUserClaims(uid, { admin: isAdmin });
      logger.info("Updated custom claims for user", { uid, role, isAdmin });
    } catch (err) {
      logger.error("Failed to update custom claims", {
        uid,
        error: (err as Error).message
      });
    }
  }
);

// ================================================================
// BROCHURE GENERATOR (CALLABLE)
// ================================================================
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
