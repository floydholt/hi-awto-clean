// functions/index.js
import * as functions from "firebase-functions";
import admin from "firebase-admin";   // ✅ use default import

import { generateVisionData } from "./aiVision.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
import { submitLead } from "./submit-lead.js";

// Initialize Firebase Admin SDK
admin.initializeApp();

// 🔥 Full pipeline: tags + caption + description + pricing + fraud
export const onListingWrite = functions.firestore
  .document("listings/{id}")
  .onWrite(async (change, ctx) => {
    const after = change.after.data();
    if (!after) return;

    const imageUrl = after.imageUrls?.[0];
    if (!imageUrl) return;

    // AI Vision
    const vision = await generateVisionData(imageUrl);

    // AI Pricing
    const pricing = await generateAIPricing({
      title: after.title || "",
      description: after.description || "",
      price: after.price || 0,
      beds: after.beds || 0,
      baths: after.baths || 0,
      sqft: after.sqft || 0,
      zip: after.zip || ""
    });

    // AI Fraud
    const fraud = await runFraudCheck(after);

    await change.after.ref.update({
      aiTags: vision.tags,
      aiCaption: vision.caption,
      aiFullDescription: vision.fullDescription,
      aiPricing: pricing,
      aiFraud: fraud
    });
  });

// Manual endpoint if needed
export const generateAIForListing = functions.https.onCall(async (data) => {
  const vision = await generateVisionData(data.imageUrl);
  const pricing = await generateAIPricing(data);
  const fraud = await runFraudCheck(data);

  return { vision, pricing, fraud };
});

// Public lead submission
export { submitLead };
