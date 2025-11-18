import * as admin from "firebase-admin";
import { onCall, HttpsError, } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentDeleted, } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI } from "@google/generative-ai";
admin.initializeApp();
const AI_API_KEY = defineSecret("AI_API_KEY");
// -----------------------------
// LOG WRITER
// -----------------------------
async function writeLog(type, message, meta = {}) {
    await admin.firestore().collection("logs").add({
        type,
        message,
        meta,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}
// -----------------------------
// FIRESTORE TRIGGER — Auto Tag New Listing
// -----------------------------
export const autoTagNewListing = onDocumentCreated({
    document: "listings/{listingId}",
    secrets: [AI_API_KEY],
    region: "us-central1",
}, async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    const genAI = new GoogleGenerativeAI(AI_API_KEY.value());
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
      Extract real-estate property features from this listing description.

      Description:
      ${data.description}

      Return ONLY a JSON array of tags.
    `;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const tags = JSON.parse(text);
        await admin
            .firestore()
            .collection("listings")
            .doc(event.params.listingId)
            .update({ tags });
        await writeLog("ai_tag", "AI auto-tagging completed", {
            listingId: event.params.listingId,
            tags,
        });
    }
    catch (err) {
        await writeLog("error", "AI auto-tagging failed", {
            error: err.toString(),
        });
    }
});
// -----------------------------
// FIRESTORE TRIGGER — Delete Storage Files When Listing Deleted
// -----------------------------
export const cleanupListingImages = onDocumentDeleted({
    document: "listings/{listingId}",
    region: "us-central1",
}, async (event) => {
    const bucket = admin.storage().bucket();
    const listingId = event.params.listingId;
    const [files] = await bucket.getFiles({
        prefix: `listings/${listingId}/`,
    });
    for (const file of files) {
        await file.delete();
    }
    await writeLog("delete_cleanup", "Listing images removed", {
        listingId,
        fileCount: files.length,
    });
});
export * from "./submit-lead";
// -----------------------------
// Callable — Manual AI Tagging
// -----------------------------
export const tagListing = onCall({ secrets: [AI_API_KEY], region: "us-central1" }, async (request) => {
    const { description } = request.data;
    if (!description) {
        throw new HttpsError("invalid-argument", "Description is required");
    }
    try {
        const genAI = new GoogleGenerativeAI(AI_API_KEY.value());
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
        Extract property feature tags from this real estate listing:
        ${description}
        Return ONLY a JSON array of strings.
      `;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const tags = JSON.parse(text);
        await writeLog("ai_tag", "Manual AI tagging completed", { tags });
        return { tags };
    }
    catch (err) {
        await writeLog("error", "Manual tagging failed", {
            error: err.toString(),
        });
        throw new HttpsError("internal", "AI tagging failed");
    }
});
