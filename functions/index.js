// functions/index.js
const functions = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");
const admin = require("firebase-admin");

admin.initializeApp();
const storage = new Storage();

// Trigger on Firestore document delete
exports.deleteListingFiles = functions
  .runWith({ minInstances: 0 })
  .region("us-central1")
  .firestore.document("listings/{listingId}")
  .onDelete(async (snap, context) => {
    const data = snap.data();
    if (!data) return null;

    const photos = data.photos || [];
    const bucketName = admin.storage().bucket().name; // default bucket

    for (const url of photos) {
      try {
        // handle gs:// and https download URLs
        if (url.startsWith("gs://")) {
          // convert to path after bucket
          const path = url.replace(`gs://${bucketName}/`, "");
          await storage.bucket(bucketName).file(path).delete({ ignoreNotFound: true });
          continue;
        }

        // For Firebase storage download URL, the path is between '/o/' and '?'
        const idx = url.indexOf("/o/");
        if (idx !== -1) {
          const part = url.substring(idx + 3);
          const path = decodeURIComponent(part.split("?")[0]);
          await storage.bucket(bucketName).file(path).delete({ ignoreNotFound: true });
        } else {
          // fallback: attempt to delete by last segment if possible
          const parsed = new URL(url);
          const possibleName = decodeURIComponent(parsed.pathname.split("/").pop());
          await storage.bucket(bucketName).file(possibleName).delete({ ignoreNotFound: true });
        }
      } catch (err) {
        console.warn("Failed to delete storage file for url:", url, err.message || err);
      }
    }

    return null;
  });
