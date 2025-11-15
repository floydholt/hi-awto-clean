/**
 * list-collections.js
 * Lists all root-level Firestore collections
 */

const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "service-account.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "hi-awto",
});

const db = admin.firestore();

async function listCollections() {
  console.log("🔍 Listing all root Firestore collections…\n");

  try {
    const collections = await db.listCollections();

    if (collections.length === 0) {
      console.log("⚠️ No collections found.");
      return;
    }

    for (const col of collections) {
      console.log("📁", col.id);
    }
  } catch (err) {
    console.error("❌ Error listing collections:", err);
  }
}

listCollections();
