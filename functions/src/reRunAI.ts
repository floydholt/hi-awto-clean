import { db } from "./admin.js";
import { generateAITags } from "./aiVision.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
import { generateAIDescription } from "./aiDescription.js";
import { recordFraudEvent } from "./aiFraudAnalytics.js";

export const reRunAIProcessing = async (listingId: string) => {
  try {
    console.log("Re-running AI for listing:", listingId);

    const snap = await db.collection("listings").doc(listingId).get();
    if (!snap.exists) throw new Error("Listing not found");

    const listing = snap.data() || {};

    const [vision, pricing, description, fraud] = await Promise.all([
      generateAITags(listing),
      generateAIPricing(listing),
      generateAIDescription(listing),
      runFraudCheck(listing),
    ]);

    await db.collection("listings").doc(listingId).update({
      aiVision: vision || null,
      aiPricing: pricing || null,
      aiDescription: description || "",
      aiFraud: fraud || null,
      aiLastUpdated: Date.now(),
    });

    await recordFraudEvent(listingId, fraud);

    console.log("AI reprocessing complete:", listingId);
    return { success: true };
  } catch (err) {
    console.error("Error rerunning AI", err);
    throw new Error(`Failed to re-run AI: ${err}`);
  }
};
