// functions/src/aiFraudAnalytics.ts
import { getFirestore } from "firebase-admin/firestore";
const db = getFirestore();
/**
 * Store each fraud event for analytics chart.
 */
export async function logFraudAnalytics(listingId, assessment) {
    const point = {
        timestamp: Date.now(),
        score: assessment.score,
        riskLevel: assessment.riskLevel,
    };
    await db
        .collection("analytics")
        .doc("fraud")
        .collection("events")
        .add({
        listingId,
        ...point,
    });
}
/**
 * Load fraud trend for chart display.
 */
export async function loadFraudTrend(days) {
    const cutoff = Date.now() - days * 86400000;
    const snap = await db
        .collection("analytics")
        .doc("fraud")
        .collection("events")
        .where("timestamp", ">", cutoff)
        .orderBy("timestamp", "asc")
        .get();
    return snap.docs.map((d) => d.data());
}
//# sourceMappingURL=aiFraudAnalytics.js.map