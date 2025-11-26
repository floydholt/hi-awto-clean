"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIDescription = generateAIDescription;
const generative_ai_1 = require("@google/generative-ai");
const MODEL = "gemini-1.5-flash";
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL });
async function generateAIDescription(input) {
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
    }
    catch (err) {
        console.error("AI description error:", err);
        return "";
    }
}
//# sourceMappingURL=aiDescription.js.map