import * as functions from "firebase-functions";
import admin from "./admin";

const db = admin.firestore();

/**
 * Utility: Ensure the function caller is an admin.
 */
function assertAdmin(context: functions.https.CallableContext) {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Not authenticated.");
  }

  if (context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Admins only.");
  }
}

/**
 * 1. Approve a listing
 */
export const approveListing = functions.https.onCall(async (data, context) => {
  assertAdmin(context);

  const { listingId } = data;
  if (!listingId) throw new functions.https.HttpsError("invalid-argument", "Missing listingId");

  await db.collection("listings").doc(listingId).update({
    status: "approved",
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * 2. Reject a listing
 */
export const rejectListing = functions.https.onCall(async (data, context) => {
  assertAdmin(context);

  const { listingId, reason } = data;
  if (!listingId) throw new functions.https.HttpsError("invalid-argument", "Missing listingId");

  await db.collection("listings").doc(listingId).update({
    status: "rejected",
    rejectionReason: reason || "Not specified",
    rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * 3. Mark as Fraud
 */
export const markFraud = functions.https.onCall(async (data, context) => {
  assertAdmin(context);

  const { listingId } = data;

  await db.collection("listings").doc(listingId).update({
    status: "fraud",
    flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * 4. Assign Agent
 */
export const assignAgent = functions.https.onCall(async (data, context) => {
  assertAdmin(context);

  const { listingId, agentId } = data;

  if (!listingId || !agentId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing listingId or agentId");
  }

  await db.collection("listings").doc(listingId).update({
    assignedAgent: agentId,
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * 5. Update listing status (generic)
 */
export const updateListingStatus = functions.https.onCall(async (data, context) => {
  assertAdmin(context);

  const { listingId, status } = data;

  await db.collection("listings").doc(listingId).update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});
