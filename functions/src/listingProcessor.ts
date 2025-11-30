import * as admin from "firebase-admin";
import { generateAITags } from "./aiVision.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
import { generateAIDescription } from "./aiDescription.js";

export async function processListingHandler(event: any) {
  const listingId = event.params.id;
  const after = event.data?.after?.data();

  if (!after) return;

  try {
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
  } catch (err) {
    console.error("Error processing listing:", listingId, err);
  }
}
