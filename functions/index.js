import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { db, auth } from "./admin.js";
import { generateAITags } from "./aiVision.js";
import { generateAIPricing } from "./aiPricing.js";
import { runFraudCheck } from "./aiFraud.js";
import { generateAIDescription } from "./aiDescription.js";
import { generateListingBrochure } from "./brochure.js";
// --------------------------------------------------------------
// LISTING PROCESSOR TRIGGER
// --------------------------------------------------------------
export const processListing = onDocumentWritten({ document: "listings/{id}", region: "us-central1" }, async (event) => {
    const listingId = event.params.id;
    const after = event.data?.after?.data();
    if (!after)
        return;
    logger.info("Processing listing", { listingId });
    try {
        const vision = await generateAITags(after.imageUrls || []);
        const pricing = await generateAIPricing({
            title: after.title || "",
            description: after.description || "",
            beds: Number(after.beds) || 0,
            baths: Number(after.baths) || 0,
            sqft: Number(after.sqft) || 0,
            zip: after.zip || "",
            price: Number(after.price) || 0,
        });
        const fraud = await runFraudCheck(after);
        const description = await generateAIDescription({
            title: after.title || "",
            address: after.address || "",
            beds: Number(after.beds) || 0,
            baths: Number(after.baths) || 0,
            sqft: Number(after.sqft) || 0,
            description: after.description || "",
            aiTags: vision.tags || [],
        });
        await db.collection("listings").doc(listingId).update({
            aiTags: vision.tags,
            aiCaption: vision.caption,
            aiPricing: pricing,
            aiFraud: fraud,
            aiFullDescription: description,
            aiUpdatedAt: new Date().toISOString(),
        });
        logger.info("AI fields updated for listing", { listingId });
    }
    catch (err) {
        logger.error("AI processing failed", { listingId, error: err });
    }
});
// --------------------------------------------------------------
// BROCHURE GENERATOR (Callable)
// --------------------------------------------------------------
export const createListingBrochure = onCall({ region: "us-central1", timeoutSeconds: 300 }, async (request) => {
    const listingId = request.data?.listingId;
    if (!listingId || typeof listingId !== "string") {
        throw new Error("listingId is required");
    }
    const storagePath = await generateListingBrochure(listingId);
    return { storagePath };
});
// --------------------------------------------------------------
// USER ROLE CLAIMS SYNC
// --------------------------------------------------------------
export const onUserRoleWrite = onDocumentWritten({ document: "users/{uid}", region: "us-central1" }, async (event) => {
    const uid = event.params.uid;
    const afterSnap = event.data?.after;
    if (!afterSnap || !afterSnap.exists) {
        await auth.setCustomUserClaims(uid, { admin: false });
        return;
    }
    const userData = afterSnap.data();
    const isAdmin = userData.role === "admin";
    await auth.setCustomUserClaims(uid, { admin: isAdmin });
});
// --------------------------------------------------------------
// ADMIN FUNCTIONS EXPORT
// --------------------------------------------------------------
export { reviewListing } from "./adminActions.js";
//# sourceMappingURL=index.js.map