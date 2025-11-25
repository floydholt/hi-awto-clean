import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIPricingInput, AIPricing } from "./types.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateAIPricing(input: AIPricingInput): Promise<AIPricing> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
Estimate fair-market price for a home based on:

Price: $${input.price}
Address: ${input.address}
Description: ${input.description}
Tags: ${input.tags.join(", ")}

Return JSON only:
{
  "estimate": number,
  "low": number,
  "high": number,
  "downPayment": number,
  "confidence": "low | medium | high",
  "reasoning": "string"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text) as AIPricing;
}
