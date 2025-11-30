import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import { onDocumentWritten } from "firebase-functions/v2/firestore";

import { sendAdminSms } from "./sms"; // Import assumes this is a separate file

// ================================================================
// 1. FIX: INITIALIZE FIREBASE ADMIN (Must be at the top)
//         using robust try/catch block
// ================================================================
try {
  admin.initializeApp();
} catch (e) {
  // Catch "app already exists" error, but re-throw others
  if (!/already exists/i.test((e as Error).message)) {
    throw e;
  }
}

const db = admin.firestore();

/**
 * 🔔 Helper: Push new internal admin alert
 */
export async function pushAdminAlert(data: {
  type: string;
  title: string;
  message: string;
  listingId?: string;
  adminId?: string;
}) {
  await db.collection("admin_alerts").add({
    ...data,
    createdAt: Date.now(),
    readBy: [],
  });
}

/**
 * 🔥 Trigger: If a listing gets HIGH fraud risk, alert all admins
 */
export const alertOnHighFraud = onDocumentWritten(
  { document: "listings/{id}", region: "us-central1" },
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    // Assuming aiFraud is an object like: { riskLevel: 'high', score: 95 }
    const fraud = after.aiFraud;
    if (!fraud) return;

    if (fraud.riskLevel === "high") {
      logger.warn("High-risk fraud detected. Alerting admins via alert panel and SMS.");

      // 2. FIX: SMS Logic MUST be inside the function scope
      try {
        await sendAdminSms(`🚨 HIGH FRAUD RISK: Listing '${after.title}' (score: ${fraud.score})`);
      } catch (e) {
        logger.error("Failed to send fraud SMS alert.", e);
      }
      
      await pushAdminAlert({
        type: "fraud_high",
        title: "🚨 High-Risk Listing Detected",
        message: `Listing '${after.title}' triggered a high fraud score (${fraud.score}).`,
        listingId: event.params.id,
      });
    }
  }
);

/**
 * 🔥 Trigger: Admin moderation action → alert other admins
 */
export const alertOnAdminReview = onDocumentWritten(
  { document: "fraud_admin_actions/{id}", region: "us-central1" },
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    // Assuming 'fraud_admin_actions' contains the necessary fields
    const { listingId, action, message, adminId } = after;

    await pushAdminAlert({
      type: "admin_action",
      title: "📝 Admin Moderation Action",
      // Ensure we check if message exists before embedding it
      message: `Admin ${adminId} marked listing '${listingId}' as '${action}'. Notes: ${message || "No notes."}`,
      listingId,
      adminId,
    });
  }
);