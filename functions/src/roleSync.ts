// src/roleSync.ts
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { auth } from "./admin.js";
import { logger } from "firebase-functions";

export const syncUserRoleToClaims = onDocumentWritten(
  { document: "users/{uid}", region: "us-central1" },
  async (event) => {
    const uid = event.params.uid;

    const after = event.data?.after;
    if (!after || !after.exists) {
      await auth.setCustomUserClaims(uid, { admin: false });
      return;
    }

    const role = after.data()?.role || "user";
    const isAdmin = role === "admin";

    try {
      await auth.setCustomUserClaims(uid, { admin: isAdmin });
      logger.info(`Updated claims for ${uid}: admin=${isAdmin}`);
    } catch (err) {
      logger.error("Failed setting claims", err);
    }
  }
);
