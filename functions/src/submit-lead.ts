import { db } from "./admin.js";

/**
 * Submit a new lead into Firestore
 */
export async function submitLead(lead: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}) {
  await db.collection("leads").add({
    ...lead,
    createdAt: Date.now(),
  });
}
