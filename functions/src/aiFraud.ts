import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ListingFraudAssessment } from "./types.js";

const MODEL = "gemini-1.5-flash";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: MODEL });

export async function runFraudCheck(
  text: string
): Promise<ListingFraudAssessment> {
  try {
    const prompt = `
Analyze this listing for fraud or suspicious behavior.
Return ONLY JSON structured like:

{
  "score": number,
  "flags": string[],
  "verdict": "legitimate" | "suspicious" | "fraudulent"
}

Text:
${text}
`;

    const res = await model.generateContent(prompt);
    return JSON.parse(res.response.text());
  } catch (err) {
    console.error("Fraud check error:", err);
    return {
      score: 0,
      flags: [],
      verdict: "legitimate",
    };
  }
}
