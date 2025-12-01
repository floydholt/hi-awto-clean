// functions/src/aiFraudAnalytics.ts
import { db } from "./admin.js";


interface FraudResult {
  score?: number;
  [key: string]: any;
}

export async function recordFraudEvent(
  listingId: string,
  fraud: FraudResult | null | undefined
): Promise<void> {
  try {
    if (!fraud) return;

    await db.collection("fraudEvents").add({
      listingId,
      score: fraud.score ?? null,
      details: fraud,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to record fraud event", listingId, err);
  }
}
