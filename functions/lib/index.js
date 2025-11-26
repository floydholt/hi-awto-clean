// functions/src/index.ts
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { generateAITags } from "./aiVision.js";
import { generateAIDescription } from "./aiDescription.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
admin.initializeApp();
const db = admin.firestore();
export const onListingWrite = onDocumentWritten({
    document: "listings/{id}",
    region: "us-central1",
}, async (event) => {
    const before = event.data?.before?.data() || null;
    const after = event.data?.after?.data() || null;
    const id = event.params.id;
    if (!after)
        return; // deleted
    const listingRef = db.collection("listings").doc(id);
    // 1) VISION
    let aiTags = [];
    let aiCaption = "";
    if (Array.isArray(after.imageUrls) && after.imageUrls.length > 0) {
        try {
            const vision = await generateAITags(after.imageUrls);
            aiTags = vision.tags;
            aiCaption = vision.caption;
        }
        catch (err) {
            console.error("Vision error:", err);
        }
    }
    // 2) FULL DESCRIPTION
    let aiFullDescription = "";
    try {
        aiFullDescription = await generateAIDescription({
            title: after.title ?? "",
            description: after.description ?? "",
            tags: aiTags,
        });
    }
    catch (err) {
        console.error("Description error:", err);
    }
    // 3) PRICING
    let aiPricing = null;
    try {
        aiPricing = await generateAIPricing({
            title: after.title ?? "",
            description: after.description ?? "",
            price: Number(after.price ?? 0),
            beds: Number(after.beds ?? 0),
            baths: Number(after.baths ?? 0),
            sqft: Number(after.sqft ?? 0),
            zip: String(after.zip ?? ""),
        });
    }
    catch (err) {
        console.error("Pricing error:", err);
    }
    // 4) FRAUD
    let aiFraud = null;
    try {
        aiFraud = await runFraudCheck(after);
        await db.collection("fraudSignals").doc(id).set({
            id,
            score: aiFraud.score,
            explanation: aiFraud.explanation,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    catch (err) {
        console.error("Fraud error:", err);
    }
    // 5) WRITE BACK
    await listingRef.set({
        aiTags,
        aiCaption,
        aiFullDescription,
        aiPricing,
        aiFraud,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
});
//# sourceMappingURL=index.js.map