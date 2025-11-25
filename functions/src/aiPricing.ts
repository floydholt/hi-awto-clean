import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIPricingInput, AIPricing } from "./types.js";

const MODEL = "gemini-1.5-flash";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: MODEL });

export async function generateAIPricing(
  input: AIPricingInput
): Promise<AIPricing> {
  try {
    const prompt = `
Estimate market pricing for this home. Return a structured JSON object.

Title: ${input.title}
Description: ${input.description}
Beds: ${input.beds}
Baths: ${input.baths}
Square feet: ${input.sqft}
ZIP: ${input.zip}

Return ONLY JSON:
{
  "estimate": number,
  "low": number,
  "high": number,
  "downPayment": number,
  "confidence": "low|medium|high",
  "reasoning": "explanation"
}
`;

    const response = await model.generateContent(prompt);
    const jsonText = response.response.text().trim();

    return JSON.parse(jsonText);
  } catch (err) {
    console.error("AI pricing error:", err);

    return {
      estimate: 0,
      low: 0,
      high: 0,
      downPayment: 0,
      confidence: "low",
      reasoning: "AI pricing unavailable.",
    };
  }
}
