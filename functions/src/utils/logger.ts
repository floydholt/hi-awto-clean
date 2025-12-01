import { db } from "../admin";

export async function logAdminEvent(eventData: {
  type: string;
  message: string;
  severity?: "info" | "warning" | "error" | "critical";
  actorId?: string;
  listingId?: string;
  userId?: string;
  metadata?: any;
}) {
  const {
    type,
    message,
    severity = "info",
    actorId = null,
    listingId = null,
    userId = null,
    metadata = {}
  } = eventData;

  await db.collection("adminLogs").add({
    type,
    message,
    severity,
    actorId,
    listingId,
    userId,
    metadata,
    timestamp: Date.now()
  });
}
