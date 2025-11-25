import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { generateAITags } from "./aiVision.js";
import { generateAIDescription } from "./aiDescription.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";

admin.initializeApp();
const db = admin.firestore();

export const onListingWrite = functions.firestore
  .document("listings/{listingId}")
  .onWrite(async (change, context) => {
    const listingId = context.params.listingId;
    const after = change.after.exists ? change.after.data() : null;
    if (!after) return;

    const imageUrls: string[] = after.imageUrls || [];

    console.log("Running AI pipeline for listing:", listingId);

    // 1. Vision
    let aiTags: string[] = [];
    let aiCaption = "";

    if (imageUrls.length > 0) {
      const vision = await generateAITags(imageUrls);
      aiTags = vision.tags;
      aiCaption = vision.caption;
    }

    // 2. Description
    const aiFullDescription = await generateAIDescription({
      title: after.title,
      address: after.address,
      description: after.description,
      price: after.price,
      downPayment: after.downPayment,
      tags: aiTags
    });

    // 3. Pricing
    const aiPricing = await generateAIPricing({
      price: after.price,
      address: after.address,
      description: after.description,
      tags: aiTags
    });

    // 4. Fraud
    const aiFraud = await runFraudCheck({
      ...after,
      aiTags
    });

    // Write back
    await db.collection("listings").doc(listingId).set(
      {
        aiTags,
        aiCaption,
        aiFullDescription,
        aiPricing,
        aiFraud,
        aiUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    console.log("AI pipeline complete:", listingId);
  });
