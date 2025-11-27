// functions/src/aiPricing.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PricingInput, AIPricing } from "./types.js";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateAIPricing(
  input: PricingInput
): Promise<AIPricing> {
  const prompt = `
Estimate a realistic home price using the following:
Title: ${input.title}
Beds: ${input.beds}
Baths: ${input.baths}
Sqft: ${input.sqft}
ZIP: ${input.zip}
User-described price: ${input.price}

Return JSON only:
{
  "estimate": number,
  "low": number,
  "high": number,
  "downPayment": number,
  "confidence": "low|medium|high",
  "reasoning": "text"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Pricing JSON parse failed:", text);
    return {
      estimate: input.price,
      low: input.price * 0.9,
      high: input.price * 1.1,
      downPayment: Math.round(input.price * 0.03),
      confidence: "low",
      reasoning: "Fallback estimate.",
    };
  }
}
