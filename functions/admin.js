// =====================================================================
// functions/src/admin.ts
// Admin role syncing, moderation, and future admin operations
// =====================================================================
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
// ---------------------------------------------------------
// IMPORTANT: Initialize admin here too (with safe check).
// This prevents "default app already exists" errors.
// ---------------------------------------------------------
if (!admin.apps.length) {
    admin.initializeApp();
}
const auth = admin.auth();
// =====================================================================
// USER ROLE → AUTH CLAIMS SYNC
// =====================================================================
export const onUserRoleWrite = onDocumentWritten({ document: "users/{uid}", region: "us-central1" }, async (event) => {
    const uid = event.params.uid;
    const afterSnap = event.data?.after;
    if (!afterSnap || !afterSnap.exists) {
        logger.info("User doc deleted, clearing claims", { uid });
        await auth.setCustomUserClaims(uid, { admin: false });
        return;
    }
    const data = afterSnap.data();
    const isAdmin = data.role === "admin";
    try {
        await auth.setCustomUserClaims(uid, { admin: isAdmin });
        logger.info("Updated custom claims", { uid, isAdmin });
    }
    catch (err) {
        logger.error("Failed to update claims", { uid, error: err });
    }
});
// =====================================================================
// FUTURE ADMIN FUNCTIONS WILL GO HERE
// (moderation actions, admin logs, alerts, etc.)
// =====================================================================
//# sourceMappingURL=admin.js.map