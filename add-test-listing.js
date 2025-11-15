/**
 * add-test-listing.js
 * Creates a simple dummy listing in Firestore to verify your app works.
 */

const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "service-account.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "hi-awto",
});

const db = admin.firestore();

async function addListing() {
  const ref = db.collection("listings").doc();

  const testDoc = {
    address: "123 Test Street",
    city: "Testville",
    state: "TX",
    price: 150000,
    rent: 1500,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    photos: [],
    test: true
  };

  await ref.set(testDoc);

  console.log("✅ Test listing created with ID:", ref.id);
}

addListing().then(() => process.exit(0));
