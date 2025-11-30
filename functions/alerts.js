import { logger } from "firebase-functions";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { db } from "./admin.js";
import { sendAdminSms } from "./sms.js";
import { sendAdminEmail } from "./email.js";
export async function sendAdminAlert(subject, message) {
    const snap = await db.collection("admins").get();
    const recipients = snap.docs.map((d) => d.data()).filter(Boolean);
    for (const adminUser of recipients) {
        if (adminUser.email)
            await sendAdminEmail(adminUser.email, subject, message);
        if (adminUser.phone)
            await sendAdminSms(message); // ✅ only pass message
    }
    return true;
}
/**
 * 🔔 Helper: Push new internal admin alert
 */
export async function pushAdminAlert(data) {
    await db.collection("admin_alerts").add({
        ...data,
        createdAt: Date.now(),
        readBy: [],
    });
}
/**
 * 🔥 Trigger: If a listing gets HIGH fraud risk, alert all admins
 */
export const alertOnHighFraud = onDocumentWritten({ document: "listings/{id}", region: "us-central1" }, async (event) => {
    const after = event.data?.after?.data();
    if (!after)
        return;
    const fraud = after.aiFraud;
    if (!fraud)
        return;
    if (fraud.riskLevel === "high") {
        logger.warn("High-risk fraud detected. Alerting admins via alert panel and SMS.");
        try {
            await sendAdminSms(`🚨 HIGH FRAUD RISK: Listing '${after.title}' (score: ${fraud.score})`);
        }
        catch (e) {
            logger.error("Failed to send fraud SMS alert.", e);
        }
        await pushAdminAlert({
            type: "fraud_high",
            title: "🚨 High-Risk Listing Detected",
            message: `Listing '${after.title}' triggered a high fraud score (${fraud.score}).`,
            listingId: event.params.id,
        });
    }
});
/**
 * 🔥 Trigger: Admin moderation action → alert other admins
 */
export const alertOnAdminReview = onDocumentWritten({ document: "fraud_admin_actions/{id}", region: "us-central1" }, async (event) => {
    const after = event.data?.after?.data();
    if (!after)
        return;
    const { listingId, action, message, adminId } = after;
    await pushAdminAlert({
        type: "admin_action",
        title: "📝 Admin Moderation Action",
        message: `Admin ${adminId} marked listing '${listingId}' as '${action}'. Notes: ${message || "No notes."}`,
        listingId,
        adminId,
    });
});
//# sourceMappingURL=alerts.js.map