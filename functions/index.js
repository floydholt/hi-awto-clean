import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

import { onDocumentDeleted, onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Initialize Firebase Admin ---
initializeApp();

const db = getFirestore();
const storage = getStorage();

// --- Secret for Gemini ---
const AI_API_KEY = defineSecret("AI_API_KEY");

// --- Auto-delete files when a listing is deleted ---
export const cleanUpListingImages = onDocumentDeleted(
  {
    document: "listings/{listingId}",
    secrets: [AI_API_KEY]
  },
  async (event) => {
    const listingId = event.params.listingId;

    const bucket = storage.bucket();
    const folder = `listings/${listingId}/`;

    const [files] = await bucket.getFiles({ prefix: folder });

    const deletions = files.map((file) => file.delete());
    await Promise.all(deletions);

    console.log(`Deleted storage folder ${folder}`);

    return { deleted: files.length };
  }
);

// --- Auto-generate property tags using Gemini ---
export const generateListingTags = onCall(
  {
    secrets: [AI_API_KEY]
  },
  async (request) => {
    const data = request.data;

    const ai = new GoogleGenerativeAI(AI_API_KEY.value());
    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const text = `
      Extract key real-estate features from this listing description.
      Return only a JSON array of short tags.

      Description:
      ${data.description}
    `;

    const response = await model.generateContent(text);
    const output = response.response.text();

    try {
      return JSON.parse(output);
    } catch {
      return { error: "Invalid Gemini response", raw: output };
    }
  }
);
