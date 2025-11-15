/**
 * smoke-test.js
 * -----------------------------------------
 * Quick Firestore read-only smoke test.
 * Confirms:
 *  - service account auth is valid
 *  - Firestore is accessible
 *  - "listings" collection exists and can be read
 *
 * Run with:
 *      node smoke-test.js
 *
 * Requirements:
 *   - service-account.json (your admin key) stored OUTSIDE git
 *   - npm install firebase-admin
 */

const admin = require("firebase-admin");
const path = require("path");

// 1) Load service account (update path if needed)
const serviceAccount = require(path.join(__dirname, "service-account.json"));

// 2) Initialize admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function run() {
  console.log("\n🔥 Firestore Smoke Test\n----------------------------------");

  try {
    // Simple query
    const snap = await db.collection("listings").limit(10).get();

    if (snap.empty) {
      console.log("⚠️ No documents found in 'listings' collection.");
    } else {
      console.log(`✅ Found ${snap.size} listing(s). Showing details:\n`);

      snap.forEach((doc) => {
        const data = doc.data();
        console.log(`• ID: ${doc.id}`);
        console.log(`  Address: ${data.address || "(no address)"}`);
        console.log(`  City: ${data.city}, State: ${data.state}`);
        console.log(`  Price: ${data.price}`);
        console.log("----------------------------------");
      });
    }

    console.log("\n🎉 Smoke test completed successfully.\n");
  } catch (err) {
    console.error("\n❌ Firestore smoke test failed:\n", err);
  }
}

run();
