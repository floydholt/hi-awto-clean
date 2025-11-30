// src/aiFraudAnalytics.ts
import { db } from "./admin.js";
import type { FraudAssessment, FraudAnalyticsPoint } from "./types.js";

const COLLECTION = "fraudEvents";

export async function recordFraudEvent(
  listingId: string,
  assessment: FraudAssessment
): Promise<void> {
  const now = Date.now();

  const point: FraudAnalyticsPoint = {
    timestamp: now,
    score: assessment.score,
    riskLevel: assessment.riskLevel
  };

  await db.collection(COLLECTION).add({
    listingId,
    ...point,
    flags: assessment.flags,
    explanation: assessment.explanation
  });
}
