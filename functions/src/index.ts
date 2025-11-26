import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { generateAITags } from "./aiVision.js";

import { generateAIDescription } from "./aiDescription.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";

initializeApp();
const db = getFirestore();

export const onListingWrite = onDocumentWritten(
  "listings/{id}",
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    const id = event.params.id;
    const ref = db.collection("listings").doc(id);

    let aiTags = after.aiTags ?? [];
    let aiCaption = after.aiCaption ?? "";
    let aiFullDescription = after.aiFullDescription ?? "";
    let aiPricing = after.aiPricing ?? null;
    let fraud = after.fraud ?? null;

    const firstImage = after.imageUrls?.[0] ?? null;

    // 1) Vision AI
    if (firstImage) {
      const vision = await generateAITags(firstImage);
      aiTags = vision.tags;
      aiCaption = vision.caption;
    }

    // 2) Full AI description
    aiFullDescription = await generateAIDescription({
      title: after.title ?? "",
      address: after.address ?? "",
      description: after.description ?? "",
      tags: aiTags,
    });

    // 3) Pricing
    aiPricing = await generateAIPricing({
      title: after.title ?? "",
      description: after.description ?? aiFullDescription,
      price: Number(after.price ?? 0),
      beds: after.beds ?? 0,
      baths: after.baths ?? 0,
      sqft: after.sqft ?? 0,
      zip: after.zip ?? "",
    });

    // 4) Fraud detection
    const fraudText = `
${after.title}
${after.description}
${aiFullDescription}
${aiPricing?.reasoning}
    `;
    fraud = await runFraudCheck(fraudText);

    // 5) Write back
    await ref.set(
      {
        aiTags,
        aiCaption,
        aiFullDescription,
        aiPricing,
        fraud,
        aiProcessedAt: new Date(),
      },
      { merge: true }
    );

    console.log(`AI pipeline completed for listing ${id}`);
  }
);
