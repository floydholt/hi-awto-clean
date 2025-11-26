// functions/src/aiFraud.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FraudAssessment } from "./types.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Analyze a listing for fraud or suspicious content.
 */
export async function runFraudCheck(
  listing: Record<string, any>
): Promise<FraudAssessment> {
  const prompt = `
Fraud detection for real-estate marketplace.

Return JSON ONLY:
{
  "score": 1-10,
  "explanation": "1 short sentence"
}

High risk signs:
- Price too low
- Reused images
- Mismatched address
- Very short or nonsense description
- Missing required fields
- Overly generic photos

Listing:
${JSON.stringify(listing, null, 2)}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([{ text: prompt }]);

  const raw = result.response.text();

  try {
    const parsed = JSON.parse(raw);

    return {
      score:
        Number(parsed.score) >= 1 && Number(parsed.score) <= 10
          ? Number(parsed.score)
          : 5,
      explanation:
        typeof parsed.explanation === "string"
          ? parsed.explanation
          : "AI fallback reasoning.",
    };
  } catch (err) {
    console.error("Fraud parse failed:", err, raw);
    return {
      score: 5,
      explanation: "AI fallback risk estimate.",
    };
  }
}
