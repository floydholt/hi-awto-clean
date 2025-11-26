// functions/src/aiDescription.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DescriptionInput } from "./types.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Generate a polished real-estate listing description.
 */
export async function generateAIDescription(
  input: DescriptionInput
): Promise<string> {
  const { title, description, tags } = input;

  const prompt = `
Create a professional real-estate property description.

Return ONLY the description text (no JSON).

Details:
Title: ${title}
Owner Description: ${description}
Tags: ${tags.join(", ")}

Tone:
- Friendly
- Clear
- Excited but realistic
- 140–220 words
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([{ text: prompt }]);
  return result.response.text().trim();
}
