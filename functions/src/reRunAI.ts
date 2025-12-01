import { db } from "./admin.js";
import { generateAITags } from "./aiVision.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
import { generateAIDescription } from "./aiDescription.js";
import { recordFraudEvent } from "./aiFraudAnalytics.js";

export const reRunAIProcessing = async (listingId: string) => {
  try {
    console.log("Re-running AI for listing:", listingId);

    // Load listing data
    const snap = await db.collection("listings").doc(listingId).get();
    if (!snap.exists) throw new Error("Listing not found");

    const listing = snap.data() as any;

    // Run all AI modules with properly shaped inputs
    const [tags, pricing, description, fraud] = await Promise.all([
      generateAITags(listing.aiTags ?? []),

      generateAIPricing({
        title: listing.title,
        description: listing.description,
        beds: listing.beds,
        baths: listing.baths,
        sqft: listing.sqft,
        price: listing.price,
        zip: listing.zip || "",
      }),

      generateAIDescription({
        title: listing.title,
        address: listing.address,
        description: listing.description,
        aiTags: listing.aiTags ?? [],
      }),

      runFraudCheck(listing),
    ]);

    // Save fraud analysis report
    await recordFraudEvent(listingId, fraud);

    console.log("AI reprocessing complete:", listingId);
    return { success: true };
  } catch (err) {
    console.error("Error rerunning AI", err);
    throw new Error(`Failed to re-run AI: ${err}`);
  }
};
