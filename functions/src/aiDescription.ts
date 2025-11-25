import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIDescriptionInput } from "./types.js";

const MODEL = "gemini-1.5-flash";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: MODEL });

export async function generateAIDescription(
  input: AIDescriptionInput
): Promise<string> {
  try {
    const prompt = `
Write a warm, friendly, professional full-length property listing description.

Title: ${input.title}
Address: ${input.address}
Owner notes: ${input.description}
AI Tags: ${input.tags.join(", ")}

Length: 2–4 paragraphs.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("AI description error:", err);
    return "";
  }
}
