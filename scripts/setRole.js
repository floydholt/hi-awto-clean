// scripts/setRole.js
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("../serviceAccountKey.json")),
});

async function setRole(uid, role) {
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`Role '${role}' assigned to user ${uid}`);
}

// Example calls:
setRole("SELLER_UID_HERE", "seller");
setRole("AGENT_UID_HERE", "agent");
setRole("ADMIN_UID_HERE", "admin");
