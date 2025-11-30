import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import { generateAITags } from "./aiVision.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
import { generateAIDescription } from "./aiDescription.js";
import { generateListingBrochure } from "./brochure.js";
// Initialize Firebase Admin once
admin.initializeApp();
// ================================================================
// LISTING PROCESSOR TRIGGER
// ================================================================
export const processListing = onDocumentWritten({ document: "listings/{id}", region: "us-central1" }, async (event) => {
    const listingId = event.params.id;
    const after = event.data?.after?.data();
    if (!after)
        return;
    logger.info("Processing listing", { listingId });
    try {
        // 1. AI VISION (tags + caption)
        const vision = await generateAITags(after.imageUrls || []);
        // 2. AI PRICING
        const pricing = await generateAIPricing({
            title: after.title || "",
            description: after.description || "",
            beds: after.beds || 0,
            baths: after.baths || 0,
            sqft: after.sqft || 0,
            zip: after.zip || "",
            price: after.price || 0,
        });
        // 3. AI FRAUD
        const fraud = await runFraudCheck(after);
        // 4. AI PROPERTY DESCRIPTION
        const description = await generateAIDescription({
            title: after.title || "",
            address: after.address || "",
            beds: after.beds || 0,
            baths: after.baths || 0,
            sqft: after.sqft || 0,
            description: after.description || "",
            aiTags: vision.tags || [],
        });
        // Save back to Firestore (merge ensures doc existence isn’t required)
        await admin.firestore().collection("listings").doc(listingId).set({
            aiTags: vision.tags,
            aiCaption: vision.caption,
            aiPricing: pricing,
            aiFraud: fraud,
            aiFullDescription: description,
            aiUpdatedAt: new Date().toISOString(),
        }, { merge: true });
        logger.info("AI fields updated for listing", { listingId });
    }
    catch (err) {
        logger.error("AI processing failed for listing", { listingId, error: err });
    }
});
// ================================================================
// USER ROLE -> AUTH CLAIMS SYNC
// ================================================================
export const onUserRoleWrite = onDocumentWritten({ document: "users/{uid}", region: "us-central1" }, async (event) => {
    const uid = event.params.uid;
    const afterSnap = event.data?.after;
    if (!afterSnap || !afterSnap.exists) {
        logger.info("User doc deleted, clearing claims", { uid });
        await admin.auth().setCustomUserClaims(uid, { admin: false });
        return;
    }
    const after = afterSnap.data();
    const isAdmin = after.role === "admin";
    try {
        await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
        logger.info("Updated custom claims", { uid, isAdmin });
    }
    catch (err) {
        logger.error("Failed to update claims", { uid, error: err });
    }
});
// ================================================================
// BROCHURE GENERATOR
// ================================================================
export const createListingBrochure = onCall({ region: "us-central1", timeoutSeconds: 300 }, async (request) => {
    const listingId = request.data?.listingId;
    if (!listingId || typeof listingId !== "string") {
        throw new Error("listingId is required");
    }
    const storagePath = await generateListingBrochure(listingId);
    return { storagePath };
});
//# sourceMappingURL=index.js.map