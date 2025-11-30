// functions/src/admin.ts
/**
 * Centralized Firebase Admin initialization file.
 * Ensures admin.initializeApp() is called ONLY once,
 * and exports db + auth cleanly for the rest of the backend.
 */
import * as admin from "firebase-admin";
// ------------------------------------------------------
// Prevent duplicate-app initialization errors
// ------------------------------------------------------
if (admin.apps.length === 0) {
    admin.initializeApp();
}
// ------------------------------------------------------
// EXPORTS (used by index.ts, adminActions.ts, alerts.ts)
// ------------------------------------------------------
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
// Re-export admin in case other modules need deeper access
export { admin };
//# sourceMappingURL=admin.js.map