"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIPricing = generateAIPricing;
const generative_ai_1 = require("@google/generative-ai");
const MODEL = "gemini-1.5-flash";
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL });
async function generateAIPricing(input) {
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
    }
    catch (err) {
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
//# sourceMappingURL=aiPricing.js.map