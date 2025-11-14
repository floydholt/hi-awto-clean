/**
 * fixCollectionNames.js
 *
 * One-time migration script to copy all documents
 * from "Listings" → "listings" in Firestore, preserving data.
 *
 * Run with: node scripts/fixCollectionNames.js
 */

const admin = require("firebase-admin");
const path = require("path");

// Load your service account file
const serviceAccount = require(path.join(__dirname, "../service-account.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "hi-awto",
});

const db = admin.firestore();

async function migrateListings() {
  const oldCollection = db.collection("Listings");
  const newCollection = db.collection("listings");

  const snapshot = await oldCollection.get();

  if (snapshot.empty) {
    console.log("✅ No documents found in 'Listings'. Nothing to migrate.");
    return;
  }

  console.log(`⚙️  Found ${snapshot.size} documents. Starting migration...`);

  const batch = db.batch();

  snapshot.forEach((doc) => {
    const oldData = doc.data();
    const newDocRef = newCollection.doc(doc.id);
    batch.set(newDocRef, oldData);
  });

  await batch.commit();
  console.log("✅ Migration complete: copied all documents to 'listings'.");

  // OPTIONAL: delete old collection
  console.log("🚨 Deleting old 'Listings' collection...");
  const deleteBatch = db.batch();
  snapshot.forEach((doc) => deleteBatch.delete(doc.ref));
  await deleteBatch.commit();

  console.log("🗑️  Old 'Listings' collection deleted successfully.");
}

migrateListings()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration error:", err);
    process.exit(1);
  });
