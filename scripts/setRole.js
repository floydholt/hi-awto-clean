// scripts/setRole.js
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with your service account
admin.initializeApp({
  credential: admin.credential.cert(require("../serviceAccountKey.json")),
});

/**
 * Assign a custom role claim to a user
 * @param {string} uid - Firebase Authentication UID of the user
 * @param {string} role - Role to assign ("seller", "agent", "admin")
 */
async function setRole(uid, role) {
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`✅ Role '${role}' assigned to user ${uid}`);
  } catch (error) {
    console.error("❌ Error assigning role:", error.message);
  }
}

// -----------------------------
// Example usage:
// Replace these UIDs with actual ones from Firebase Console → Authentication → Users
// -----------------------------

// Seller
setRole("ysh3IiDx4OO2LZu9tynUv7md7WC3", "seller");

// Agent
setRole("2FPMooCr8PXvUjM6NEfCwBFH0Ok1", "agent");

// Admin
setRole("3gw0xQIcCwZjA1q6bURymnzQREq2", "admin");
