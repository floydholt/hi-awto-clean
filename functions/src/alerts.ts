// functions/src/alerts.ts
import { logger } from "firebase-functions";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { db } from "./admin.js";
import { broadcastAdminSms } from "./sms.js";
import { broadcastAdminEmail } from "./email.js";

export async function sendAdminAlert(subject: string, message: string) {
  await broadcastAdminEmail(subject, message);
  await broadcastAdminSms(`${subject}: ${message}`);
  return true;
}

/**
 * Internal alert doc for UI panel
 */
export async function pushAdminAlert(data: any) {
  await db.collection("admin_alerts").add({
    ...data,
    createdAt: Date.now(),
    readBy: [],
  });
}

/**
 * High-fraud auto-alert trigger
 */
export const alertOnHighFraud = onDocumentWritten(
  { document: "listings/{id}", region: "us-central1" },
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return;
    const fraud = after.aiFraud;
    if (!fraud) return;

    if (fraud.riskLevel === "high") {
      logger.warn("High fraud detected:", fraud);

      await sendAdminAlert(
        "🚨 High Fraud Detected",
        `Listing '${after.title}' flagged with score ${fraud.score}`
      );

      await pushAdminAlert({
        type: "fraud_high",
        title: "High-Risk Listing Detected",
        message: `Listing '${after.title}' scored ${fraud.score}.`,
        listingId: event.params.id,
      });
    }
  }
);
