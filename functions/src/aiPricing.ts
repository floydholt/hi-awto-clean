// functions/src/aiPricing.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PricingInput, AIPricing } from "./types.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Predict suggested listing price.
 */
export async function generateAIPricing(
  input: PricingInput
): Promise<AIPricing> {
  const prompt = `
You are estimating a fair lease-to-own listing price.

Return JSON ONLY:
{
  "estimate": number,
  "low": number,
  "high": number,
  "downPayment": number,
  "confidence": "high|medium|low",
  "reasoning": "1 sentence explanation"
}

Input:
${JSON.stringify(input, null, 2)}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([{ text: prompt }]);
  let raw = result.response.text().trim();

  try {
    const json = JSON.parse(raw);

    return {
      estimate: Number(json.estimate ?? 0),
      low: Number(json.low ?? 0),
      high: Number(json.high ?? 0),
      downPayment: Number(json.downPayment ?? 0),
      confidence: json.confidence || "medium",
      reasoning: json.reasoning || "",
    };
  } catch (e) {
    console.error("Pricing parse error:", raw, e);
    return {
      estimate: 0,
      low: 0,
      high: 0,
      downPayment: 0,
      confidence: "low",
      reasoning: "AI fallback estimate.",
    };
  }
}
