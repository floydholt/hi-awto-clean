/**
 * Cloud Functions for HI AWTO
 * - AI image tagging via Google Cloud Vision
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const vision = require("@google-cloud/vision");

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Google Cloud Vision client
// Make sure Vision API is enabled in your GCP project.
const visionClient = new vision.ImageAnnotatorClient();

/**
 * Callable function:
 * analyzeImageLabels({ imageUrl })
 *
 * - imageUrl: HTTPS URL to the image (e.g. Firebase Storage download URL)
 * - Returns: { tags: string[], raw: ... }
 *
 * This runs on the backend, so your Vision API key/credentials
 * never touch the client.
 */
exports.analyzeImageLabels = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    const imageUrl = data?.imageUrl;

    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to analyze images."
      );
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "imageUrl (string) is required."
      );
    }

    try {
      // Ask Vision for labels on this image
      const [result] = await visionClient.labelDetection(imageUrl);
      const labels = result.labelAnnotations || [];

      // Convert labels to simple "tags"
      const tags = labels
        .filter((label) => label.score >= 0.7) // keep only confident labels
        .map((label) => label.description.trim().toLowerCase())
        .filter(Boolean);

      return {
        tags,
        raw: {
          labels: labels.map((l) => ({
            description: l.description,
            score: l.score,
          })),
        },
      };
    } catch (err) {
      console.error("Vision analyzeImageLabels error:", err);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to analyze image."
      );
    }
  });
