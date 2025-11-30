import { db } from "./admin.js";
/**
 * Submit a new lead into Firestore
 */
export async function submitLead(lead) {
    await db.collection("leads").add({
        ...lead,
        createdAt: Date.now(),
    });
}
//# sourceMappingURL=submit-lead.js.map