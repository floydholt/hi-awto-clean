// src/roleSync.ts
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { auth } from "./admin.js";
import { logger } from "firebase-functions";
import { logAdminEvent } from "./utils/logger.js";

export const syncUserRoleToClaims = onDocumentWritten(
  { document: "users/{uid}", region: "us-central1" },
  async (event) => {
    const uid = event.params.uid;

    const after = event.data?.after;
    const before = event.data?.before;

    // If user doc was deleted → remove claims
    if (!after || !after.exists) {
      await auth.setCustomUserClaims(uid, { admin: false });

      await logAdminEvent({
        type: "ADMIN_DELETION",
        message: `User document deleted. Removed admin claims for ${uid}.`,
        severity: "warning",
        userId: uid
      });

      return;
    }

    const newRole = after.data()?.role || "user";
    const oldRole = before?.data()?.role || "user";
    const isAdmin = newRole === "admin";

    try {
      await auth.setCustomUserClaims(uid, { admin: isAdmin });

      logger.info(`Updated claims for ${uid}: admin=${isAdmin}`);

      // Promotion
      if (newRole === "admin" && oldRole !== "admin") {
        await logAdminEvent({
          type: "ADMIN_PROMOTION",
          message: `User ${uid} promoted to admin.`,
          severity: "info",
          userId: uid
        });
      }

      // Demotion
      if (oldRole === "admin" && newRole !== "admin") {
        await logAdminEvent({
          type: "ADMIN_DEMOTION",
          message: `User ${uid} demoted from admin.`,
          severity: "warning",
          userId: uid
        });
      }

    } catch (err) {
      logger.error("Failed setting claims", err);
      await logAdminEvent({
        type: "ADMIN_CLAIM_ERROR",
        message: `Failed to update admin claims for ${uid}: ${err.message}`,
        severity: "error",
        userId: uid,
        metadata: { stack: err.stack }
      });
    }
  }
);
