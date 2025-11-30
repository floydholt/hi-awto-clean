import { db, auth } from "./admin.js";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
/**
 * Trigger: Sync user role → custom claims
 */
export const onUserRoleWrite = onDocumentWritten({ document: "users/{uid}", region: "us-central1" }, async (event) => {
    const uid = event.params.uid;
    const afterSnap = event.data?.after;
    if (!afterSnap || !afterSnap.exists) {
        await auth.setCustomUserClaims(uid, { admin: false });
        return;
    }
    const userData = afterSnap.data();
    const isAdmin = userData.role === "admin";
    await auth.setCustomUserClaims(uid, { admin: isAdmin });
});
/**
 * Example admin action: review listing
 */
export async function reviewListing(listingId, action, notes) {
    await db.collection("fraud_admin_actions").add({
        listingId,
        action,
        message: notes || "",
        createdAt: Date.now(),
    });
}
//# sourceMappingURL=adminActions.js.map