// src/listingProcessor.ts.ts
import * as admin from "firebase-admin";
import { generateAITags } from "./aiVision.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
import { generateAIDescription } from "./aiDescription.js";
import { logAdminEvent } from "./utils/logger.js";

export async function processListingHandler(event: any) {
  const listingId = event.params.id;
  const after = event.data?.after?.data();

  if (!after) return;

  try {
    // Start log
    await logAdminEvent({
      type: "LISTING_PROCESSING_STARTED",
      message: `AI processing started for listing ${listingId}`,
      severity: "info",
      listingId
    });

    const vision = await generateAITags(after.imageUrls || []);

    const pricing = await generateAIPricing({
      title: after.title || "",
      description: after.description || "",
      beds: after.beds || 0,
      baths: after.baths || 0,
      sqft: after.sqft || 0,
      zip: after.zip || "",
      price: after.price || 0,
    });

    const fraud = await runFraudCheck(after);

    const description = await generateAIDescription({
      title: after.title,
      address: after.address,
      beds: after.beds,
      baths: after.baths,
      sqft: after.sqft,
      description: after.description,
      aiTags: vision.tags,
    });

    await admin.firestore().collection("listings").doc(listingId).update({
      aiTags: vision.tags,
      aiCaption: vision.caption,
      aiPricing: pricing,
      aiFraud: fraud,
      aiFullDescription: description,
      aiUpdatedAt: new Date().toISOString(),
    });

    // Fraud flag logging
    if (fraud?.score > 75) {
      await logAdminEvent({
        type: "FRAUD_FLAG_HIGH",
        message: `High fraud score (${fraud.score}) detected on listing ${listingId}`,
        severity: "warning",
        listingId,
        metadata: fraud
      });
    }

    // Success log
    await logAdminEvent({
      type: "LISTING_PROCESSED",
      message: `Listing ${listingId} successfully processed by AI.`,
      severity: "info",
      listingId
    });

  } catch (err) {
    console.error("Error processing listing:", listingId, err);

    await logAdminEvent({
      type: "AI_ERROR",
      message: `AI failed on listing ${listingId}: ${err.message}`,
      severity: "error",
      listingId,
      metadata: { stack: err.stack }
    });
  }
}
