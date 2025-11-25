import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIDescriptionInput } from "./types.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateAIDescription(input: AIDescriptionInput): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
Write a friendly real-estate listing description using the following details:

Title: ${input.title}
Address: ${input.address}
Listed Price: $${input.price}
Down Payment: $${input.downPayment}

Existing Notes: ${input.description}

AI Tags: ${input.tags.join(", ")}

Write 2–3 paragraphs. Keep it warm, helpful, and descriptive.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
