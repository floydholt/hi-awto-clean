// src/aiDescription.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DescriptionInput, AIDescription } from "./types.js";

const apiKey = process.env.GEMINI_API_KEY;
const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = client ? client.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

export async function generateAIDescription(input: DescriptionInput): Promise<string> {
  if (!model) {
    return input.description || "";
  }

  const { title, address, beds, baths, sqft, description, aiTags } = input;

  const prompt =
    "You are a real estate copywriter. Write a compelling but honest 3–5 paragraph property description. " +
    "Use neutral, fair-housing-compliant language. " +
    "Use the existing description as raw notes and improve clarity and structure.\n\n" +
    `Title: ${title}\n` +
    `Address: ${address}\n` +
    `Beds: ${beds ?? ""}\n` +
    `Baths: ${baths ?? ""}\n` +
    `SqFt: ${sqft ?? ""}\n` +
    `Existing description: ${description}\n` +
    `AI tags: ${aiTags.join(", ")}\n\n` +
    "Return ONLY the final listing description text. No JSON.";

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text;
  } catch (err) {
    console.error("AI Description Error:", err);
    return description || "";
  }
}
