import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
/**
 * Valid Admin Actions
 */
const VALID_ACTIONS = ["approve", "reject", "needs_docs"];
/**
 * Callable Function: admin.reviewListing
 * Allows an admin to approve/reject listings with justification
 */
export const reviewListing = onCall({ region: "us-central1" }, async (request) => {
    const authUser = request.auth;
    const { listingId, action, message } = request.data || {};
    if (!authUser)
        throw new Error("Not authenticated");
    if (!authUser.token.admin)
        throw new Error("Admin privileges required");
    if (!VALID_ACTIONS.includes(action))
        throw new Error("Invalid action");
    if (!listingId)
        throw new Error("listingId is required");
    // Resolve listing reference
    const ref = db.collection("listings").doc(listingId);
    const snap = await ref.get();
    if (!snap.exists)
        throw new Error("Listing not found");
    // Update listing moderation state
    await ref.update({
        adminReview: {
            action,
            message: message || "",
            reviewedBy: authUser.uid,
            reviewedAt: new Date().toISOString(),
        },
        status: action === "approve" ? "approved" : "flagged",
    });
    // Log event to fraud_events_admin
    await db.collection("fraud_admin_actions").add({
        listingId,
        action,
        message: message || "",
        adminId: authUser.uid,
        timestamp: Date.now(),
    });
    return { success: true };
});
//# sourceMappingURL=adminActions.js.map