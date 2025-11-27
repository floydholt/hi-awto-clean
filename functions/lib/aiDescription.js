// functions/src/aiDescription.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
export async function generateAIDescription(input) {
    const prompt = `
Generate a professional real estate property description.
Use MLS tone.
Use 2–3 paragraphs.
Avoid repeating numbers excessively.
Do NOT invent features not provided.

Inputs:
Title: ${input.title}
Address: ${input.address}
Beds: ${input.beds}
Baths: ${input.baths}
Sqft: ${input.sqft}
User Description: ${input.description}
AI Tags: ${input.aiTags.join(", ")}
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return { fullDescription: text };
}
//# sourceMappingURL=aiDescription.js.map